import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiTrash, FiMapPin, FiUser, FiPhone, FiMail, FiCreditCard, FiDollarSign, FiPlus, FiUpload } from 'react-icons/fi';
import Header from '../Components/Shared/Header';

const ProfilePage = () => {
    const userId = localStorage.getItem('userId');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        phone_number: '',
        addresses: [],
        cards: [],
        upiIds: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [paymentType, setPaymentType] = useState('card');
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

    // Existing fetch and handler methods remain the same...

    return (
        <div className="min-h-screen bg-gray-50">
            <Header transparent={false}/>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm p-6">
                        <nav className="space-y-4">
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
                                <FiUser className="mr-3" /> Personal Details
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
                                <FiMapPin className="mr-3" /> Addresses
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
                                <FiCreditCard className="mr-3" /> Payment Options
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Personal Details */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-gray-600 hover:text-gray-900 flex items-center"
                                >
                                    <FiEdit className="mr-2" /> {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            {/* Existing personal details content */}
                            {/* ... */}
                        </div>

                        {/* Address Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
                                <button
                                    onClick={() => setIsEditingAddress(true)}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center"
                                >
                                    <FiPlus className="mr-2" /> Add New Address
                                </button>
                            </div>

                            {/* Existing address content */}
                            {/* ... */}
                        </div>

                        {/* Payment Options Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
                                <button
                                    onClick={() => setIsAddingPayment(true)}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center"
                                >
                                    <FiPlus className="mr-2" /> Add Payment Option
                                </button>
                            </div>
                    {isAddingPayment && (
                        <div className="space-y-4 mb-6">
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
                    )}

                    {/* Saved Cards */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Saved Cards</h3>
                        {userData.cards.map((card) => (
                            <div key={card._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-gray-700">{card.name}</p>
                                    <p className="text-gray-700">**** **** **** {card.lastFourDigits}</p>
                                    <p className="text-sm text-gray-500">Expires: {card.expiryDate}</p>
                                </div>
                                <button
                                    onClick={() => handleRemovePayment('card', card._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FiTrash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Saved UPI IDs */}
                    <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900">Saved UPI IDs</h3>
                        {userData.upiIds.map((upi) => (
                            <div key={upi._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                <p className="text-gray-700">{upi.upiId}</p>
                                <button
                                    onClick={() => handleRemovePayment('upi', upi._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FiTrash size={16} />
                                </button>
                            </div>
                        ))}
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;