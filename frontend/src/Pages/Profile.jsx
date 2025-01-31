import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiEdit, FiTrash, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '../Components/Shared/Header';
import CARD from "../Images/card.png";
import { FaBoxOpen } from "react-icons/fa";
import { FiLogOut } from 'react-icons/fi';



import UPI from "../Images/upi.png";
import { useNavigate } from 'react-router-dom';
const ProfilePage = () => {
    const navigate=useNavigate();
    const userId = localStorage.getItem('userId');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone_number: '',
        addresses: [],
        cards: [],
        upiIds: [],
    });
    const [activeSection, setActiveSection] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [paymentType, setPaymentType] = useState('card'); // 'card' or 'upi'
    const [newPayment, setNewPayment] = useState({
        name: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        upiId: '',
    });
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const handleorder= async ()=>{
        navigate('/orders');
    }

    const handleLogout = async () => {
        try {
          // Call the logout API
          const response = await fetch('/api/users/logout', {
            method: 'POST',
          });
    
          if (!response.ok) {
            throw new Error('Logout failed');
          }
    
          // Clear userId and set isLogin to false in localStorage
          localStorage.removeItem('userId');
          localStorage.setItem('isLogin', false);
          localStorage.setItem('isAdmin', false);
    
          // Redirect to the login page
          navigate('/login');
        } catch (err) {
          console.error('Error during logout:', err);
          alert('Logout failed. Please try again.');
        }
      };
    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/users/getuserbyid/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUserData(data.user);
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };
        fetchUserData();
    }, [userId]);

    // Handle form change for personal details
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    // Handle address input change
    const handleAddressChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    // Handle payment input change
    const handlePaymentChange = (e) => {
        setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
    };

    // Add a new address
    const handleAddAddress = async () => {
        if (
            !newAddress.street ||
            !newAddress.city ||
            !newAddress.state ||
            !newAddress.postalCode ||
            !newAddress.country
        ) {
            alert('Please fill out all address fields.');
            return;
        }

        try {
            const response = await fetch(`/api/users/addaddress/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress),
            });

            if (!response.ok) {
                throw new Error('Failed to add address');
            }

            // Manually update the state
            const updatedAddresses = [...userData.addresses, newAddress];
            setUserData({ ...userData, addresses: updatedAddresses });

            // Reset form
            setNewAddress({
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
            });
            setIsEditingAddress(false);
        } catch (err) {
            console.error('Error adding address:', err);
        }
    };

    // Edit an address
    const handleEditAddress = (index) => {
        setEditingAddressIndex(index);
        setNewAddress(userData.addresses[index]);
        setIsEditingAddress(true);
    };

    const handleSaveEditedAddress = async () => {
        if (
            !newAddress.street ||
            !newAddress.city ||
            !newAddress.state ||
            !newAddress.postalCode ||
            !newAddress.country
        ) {
            alert('Please fill out all address fields.');
            return;
        }

        try {
            const updatedAddresses = [...userData.addresses];
            updatedAddresses[editingAddressIndex] = newAddress;

            const response = await fetch(`/api/users/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresses: updatedAddresses }),
            });

            if (!response.ok) {
                throw new Error('Failed to update address');
            }

            // Manually update the state
            setUserData({ ...userData, addresses: updatedAddresses });
            setIsEditingAddress(false);
            setEditingAddressIndex(null);
        } catch (err) {
            console.error('Error updating address:', err);
        }
    };

    // Remove an address
    const handleRemoveAddress = async (index) => {
        const addressId = userData.addresses[index]._id;
        try {
            const response = await fetch(`/api/users/removeaddress/${userId}/${addressId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove address');
            }

            // Manually update the state
            const updatedAddresses = userData.addresses.filter((_, i) => i !== index);
            setUserData({ ...userData, addresses: updatedAddresses });
        } catch (err) {
            console.error('Error removing address:', err);
        }
    };

    // Add a new payment option
    const handleAddPayment = async () => {
        if (paymentType === 'card') {
            if (!newPayment.name || !newPayment.cardNumber || !newPayment.expiryDate || !newPayment.cvv) {
                alert('Please fill out all card details.');
                return;
            }
        } else if (paymentType === 'upi') {
            if (!newPayment.upiId) {
                alert('Please enter a valid UPI ID.');
                return;
            }
        }

        try {
            const endpoint = paymentType === 'card' 
                ? `/api/users/addcard/${userId}` 
                : `/api/users/addupi/${userId}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPayment),
            });

            if (!response.ok) {
                console.log(response);
                throw new Error(`Failed to add ${paymentType}`);
            }

            // Manually update the state
            if (paymentType === 'card') {
                const updatedCards = [...userData.cards, newPayment];
                setUserData({ ...userData, cards: updatedCards });
            } else if (paymentType === 'upi') {
                const updatedUpiIds = [...userData.upiIds, { upiId: newPayment.upiId }];
                setUserData({ ...userData, upiIds: updatedUpiIds });
            }

            // Reset form
            setNewPayment({
                name: '',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                upiId: '',
            });
            setIsAddingPayment(false);
        } catch (err) {
            console.error(`Error adding ${paymentType}:`, err);
        }
    };

    // Remove a payment option
    const handleRemovePayment = async (type, id) => {
        try {
            const endpoint = type === 'card' 
                ? `/api/users/removecard/${userId}/${id}` 
                : `/api/users/removeupi/${userId}/${id}`;
            const response = await fetch(endpoint, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to remove ${type}`);
            }

            // Manually update the state
            if (type === 'card') {
                const updatedCards = userData.cards.filter(card => card._id !== id);
                setUserData({ ...userData, cards: updatedCards });
            } else if (type === 'upi') {
                const updatedUpiIds = userData.upiIds.filter(upi => upi._id !== id);
                setUserData({ ...userData, upiIds: updatedUpiIds });
            }
        } catch (err) {
            console.error(`Error removing ${type}:`, err);
        }
    };

    // Get card symbol based on card number
    const getCardSymbol = (cardNumber) => {
        if (/^4/.test(cardNumber)) {
            return 'Visa';
        } else if (/^5[1-5]/.test(cardNumber)) {
            return 'Mastercard';
        } else if (/^3[47]/.test(cardNumber)) {
            return 'American Express';
        } else {
            return 'Card';
        }
    };

    // Mobile Accordion State
    const [mobileAccordion, setMobileAccordion] = useState({
        personal: false,
        addresses: false,
        payments: false,
    });

    const toggleMobileAccordion = (section) => {
        setMobileAccordion({
            ...mobileAccordion,
            [section]: !mobileAccordion[section],
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header transparent={false} />
            <div className="container mx-auto p-6 max-w-7xl md:mt-[7%] md:mb-[0%] mb-[13%]">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                {/* Mobile Accordion */}
                <div className="md:hidden mb-6">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Personal Details Accordion */}
                        <div className="border-b border-gray-200">
                            <button
                                onClick={() => toggleMobileAccordion('personal')}
                                className="w-full flex items-center justify-between p-4 text-gray-700"
                            >
                                <span className="flex items-center">
                                    <FiUser size={20} className="mr-2" />
                                    Personal Details
                                </span>
                                {mobileAccordion.personal ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </button>
                            {mobileAccordion.personal && (
                                <div className="p-4 bg-gray-50">
                                    {isEditing ? (
                                        <form className="space-y-4">
                                            {['name', 'email', 'phone_number'].map((field) => (
                                                <div key={field}>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        {field.replace('_', ' ')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={field}
                                                        value={userData[field]}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Save Changes
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <FiUser size={24} className="text-gray-500" />
                                                <p className="text-gray-700">{userData.name}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <FiMail size={24} className="text-gray-500" />
                                                <p className="text-gray-700">{userData.email}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <FiPhone size={24} className="text-gray-500" />
                                                <p className="text-gray-700">{userData.phone_number}</p>
                                            </div>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Edit Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Addresses Accordion */}
                        <div className="border-b border-gray-200">
                            <button
                                onClick={() => toggleMobileAccordion('addresses')}
                                className="w-full flex items-center justify-between p-4 text-gray-700"
                            >
                                <span className="flex items-center">
                                    <FiMapPin size={20} className="mr-2" />
                                    Addresses
                                </span>
                                {mobileAccordion.addresses ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </button>
                            {mobileAccordion.addresses && (
                                <div className="p-4 bg-gray-50">
                                    {isEditingAddress ? (
                                        <div className="space-y-4">
                                            {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                                                <input
                                                    key={field}
                                                    type="text"
                                                    name={field}
                                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                    value={newAddress[field]}
                                                    onChange={handleAddressChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                />
                                            ))}
                                            <button
                                                onClick={editingAddressIndex !== null ? handleSaveEditedAddress : handleAddAddress}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                {editingAddressIndex !== null ? 'Save Address' : 'Add Address'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userData.addresses.map((address, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <p className="text-gray-700">{address.street}, {address.city}, {address.state}, {address.postalCode}, {address.country}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditAddress(index)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveAddress(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <FiTrash size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setIsEditingAddress(true)}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Add New Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment Options Accordion */}
                        <div className="border-b border-gray-200">
                            <button
                                onClick={() => toggleMobileAccordion('payments')}
                                className="w-full flex items-center justify-between p-4 text-gray-700"
                            >
                                <span className="flex items-center">
                                    <FiCreditCard size={20} className="mr-2" />
                                    Payment Options
                                </span>
                                {mobileAccordion.payments ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </button>
                            {mobileAccordion.payments && (
                                <div className="p-4 bg-gray-50">
                                    {isAddingPayment ? (
                                        <div className="space-y-4">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => setPaymentType('card')}
                                                    className={`px-4 py-2 rounded-lg ${paymentType === 'card' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    Card
                                                </button>
                                                <button
                                                    onClick={() => setPaymentType('upi')}
                                                    className={`px-4 py-2 rounded-lg ${paymentType === 'upi' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    UPI
                                                </button>
                                            </div>
                                            {paymentType === 'card' ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder="Cardholder Name"
                                                        value={newPayment.name}
                                                        onChange={handlePaymentChange}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="cardNumber"
                                                        placeholder="Card Number"
                                                        value={newPayment.cardNumber}
                                                        onChange={handlePaymentChange}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            name="expiryDate"
                                                            placeholder="MM/YY"
                                                            value={newPayment.expiryDate}
                                                            onChange={handlePaymentChange}
                                                            className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="cvv"
                                                            placeholder="CVV"
                                                            value={newPayment.cvv}
                                                            onChange={handlePaymentChange}
                                                            className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="upiId"
                                                    placeholder="UPI ID"
                                                    value={newPayment.upiId}
                                                    onChange={handlePaymentChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                />
                                            )}
                                            <button
                                                onClick={handleAddPayment}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Add Payment
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userData.cards.map((card, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <p className="text-gray-700">{card.name}</p>
                                                        <p className="text-gray-700">**** **** **** {card.lastFourDigits}</p>
                                                        <p className="text-sm text-gray-500">Expires: {card.expiryDate}</p>
                                                        <img
                                                            src={CARD}
                                                            alt={getCardSymbol(card.cardNumber)}
                                                            className="w-8 h-8 mt-2"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePayment('card', card._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiTrash size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {userData.upiIds.map((upi, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <p className="text-gray-700">{upi.upiId}</p>
                                                        <img
                                                            src={UPI}
                                                            alt="UPI"
                                                            className="w-8 h-8 mt-2"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePayment('upi', upi._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiTrash size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setIsAddingPayment(true)}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Add Payment Option
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content for Desktop */}
                <div className="hidden md:flex">
                    {/* Desktop Sidebar */}
                    <div className="w-64 lg:w-72 mr-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <nav>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => setActiveSection('personal')}
                                            className={`w-full flex items-center space-x-3 p-3 ${
                                                activeSection === 'personal'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <FiUser size={20} />
                                            <span>Personal Details</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setActiveSection('addresses')}
                                            className={`w-full flex items-center space-x-3 p-3 ${
                                                activeSection === 'addresses'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <FiMapPin size={20} />
                                            <span>Addresses</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setActiveSection('payments')}
                                            className={`w-full flex items-center space-x-3 p-3 ${
                                                activeSection === 'payments'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <FiCreditCard size={20} />
                                            <span>Payment Options</span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* Personal Details Section */}
                        {activeSection === 'personal' && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Details</h2>
                                {isEditing ? (
                                    <form className="space-y-4">
                                        {['name', 'email', 'phone_number'].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                    {field.replace('_', ' ')}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field}
                                                    value={userData[field]}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            Save Changes
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <FiUser size={24} className="text-gray-500" />
                                            <p className="text-gray-700">{userData.name}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <FiMail size={24} className="text-gray-500" />
                                            <p className="text-gray-700">{userData.email}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <FiPhone size={24} className="text-gray-500" />
                                            <p className="text-gray-700">{userData.phone_number}</p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            Edit Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Section */}
                        {activeSection === 'addresses' && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Addresses</h2>
                                {isEditingAddress ? (
                                    <div className="space-y-4">
                                        {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                                            <input
                                                key={field}
                                                type="text"
                                                name={field}
                                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                                value={newAddress[field]}
                                                onChange={handleAddressChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        ))}
                                        <button
                                            onClick={editingAddressIndex !== null ? handleSaveEditedAddress : handleAddAddress}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            {editingAddressIndex !== null ? 'Save Address' : 'Add Address'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userData.addresses.map((address, index) => (
                                            <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="text-gray-700">{address.street}, {address.city}, {address.state}, {address.postalCode}, {address.country}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditAddress(index)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveAddress(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiTrash size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setIsEditingAddress(true)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            Add New Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Options Section */}
                        {activeSection === 'payments' && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Options</h2>
                                {isAddingPayment ? (
                                    <div className="space-y-4">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => setPaymentType('card')}
                                                className={`px-4 py-2 rounded-lg ${paymentType === 'card' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                Card
                                            </button>
                                            <button
                                                onClick={() => setPaymentType('upi')}
                                                className={`px-4 py-2 rounded-lg ${paymentType === 'upi' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                UPI
                                            </button>
                                        </div>
                                        {paymentType === 'card' ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Cardholder Name"
                                                    value={newPayment.name}
                                                    onChange={handlePaymentChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                />
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    placeholder="Card Number"
                                                    value={newPayment.cardNumber}
                                                    onChange={handlePaymentChange}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                />
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        name="expiryDate"
                                                        placeholder="MM/YY"
                                                        value={newPayment.expiryDate}
                                                        onChange={handlePaymentChange}
                                                        className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        placeholder="CVV"
                                                        value={newPayment.cvv}
                                                        onChange={handlePaymentChange}
                                                        className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                name="upiId"
                                                placeholder="UPI ID"
                                                value={newPayment.upiId}
                                                onChange={handlePaymentChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        )}
                                        <button
                                            onClick={handleAddPayment}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            Add Payment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userData.cards.map((card, index) => (
                                            <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="text-gray-700">{card.name}</p>
                                                    <p className="text-gray-700">**** **** **** {card.lastFourDigits}</p>
                                                    <p className="text-sm text-gray-500">Expires: {card.expiryDate}</p>
                                                    <img
                                                        src={CARD}
                                                        alt={getCardSymbol(card.cardNumber)}
                                                        className="w-8 h-8 mt-2"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePayment('card', card._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FiTrash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {userData.upiIds.map((upi, index) => (
                                            <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="text-gray-700">{upi.upiId}</p>
                                                    <img
                                                        src={UPI}
                                                        alt="UPI"
                                                        className="w-8 h-8 mt-2"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePayment('upi', upi._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FiTrash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setIsAddingPayment(true)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            Add Payment Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
<div className="flex items-center gap-4 md:gap-6 lg:gap-8">
      <button onClick={handleorder} className="flex items-center gap-2 px-6 py-3 text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300">
        <FaBoxOpen className="text-xl" />
        <span className="text-base font-medium">Orders</span>
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-6 py-3 text-white bg-black rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300"
      >
        <FiLogOut className="text-xl" />
        <span className="text-base font-medium">Logout</span>
      </button>
    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;