import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Shared/Header';
import Alert from '../Components/Shared/Alert';
import { FaPlus } from 'react-icons/fa';

const OrderSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, totalAmount } = location.state || { cartItems: [], totalAmount: 0 };

    const [userDetails, setUserDetails] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', postalCode: '', country: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`/api/users/getuserbyid/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const userData = await response.json();
                setUserDetails(userData.user);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

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
            const updatedAddresses = [...userDetails.addresses, newAddress];
            setUserDetails({ ...userDetails, addresses: updatedAddresses });

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

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    const handleProceedToPayment = () => {
        if (!selectedAddress) {
            setAlertMessage({ 
                message: 'Please select an address', 
                type: 'error' 
            });
            return;
        }

        navigate('/payment', { 
            state: { 
                cartItems, 
                totalAmount, 
                selectedAddress,
                estimatedDeliveryDate 
            } 
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header transparent={false} />
            
            {alertMessage && (
                <Alert
                    message={alertMessage.message}
                    type={alertMessage.type}
                    onClose={() => setAlertMessage(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-light mb-8">Order Summary</h1>

                {/* Cart Items Display */}
                <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">Your Order</h2>
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between border-b py-4">
                            <div className="flex items-center">
                                <img 
                                    src={item.product_id.image[0]} 
                                    alt={item.product_id.name} 
                                    className="w-16 h-16 object-cover rounded-lg mr-4"
                                />
                                <div>
                                    <h3 className="text-lg font-medium">{item.product_id.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity} | Size: {item.size}
                                    </p>
                                </div>
                            </div>
                            <p className="text-lg font-medium">
                                ₹{item.product_id.CurrentPrice * item.quantity}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Total Amount */}
                <div className="mb-8">
                    <div className="flex justify-between">
                        <span className="text-lg text-gray-700">Total Amount</span>
                        <span className="text-lg font-medium">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Estimated Delivery */}
                <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">Estimated Delivery</h2>
                    <p className="text-gray-600">
                        {estimatedDeliveryDate.toLocaleDateString('en-US', {
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Address Selection */}
                <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">Select Delivery Address</h2>
                    {userDetails?.addresses?.map((address, index) => (
                        <div 
                            key={index}
                            className={`p-4 border rounded-lg mb-2 cursor-pointer ${
                                selectedAddress === address ? 'border-black' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedAddress(address)}
                        >
                            <p>{address.street}, {address.city}, {address.state}, {address.postalCode}, {address.country}</p>
                        </div>
                    ))}

                    {/* Add New Address */}
                    {showAddAddress && (
                        <div className="mt-4 space-y-2">
                            {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                                <input
                                    key={field}
                                    type="text"
                                    name={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={newAddress[field]}
                                    onChange={handleNewAddressChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            ))}
                            <button
                                onClick={handleAddAddress}
                                className="w-full bg-black text-white py-2 rounded-md"
                            >
                                Save Address
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowAddAddress(!showAddAddress)}
                        className="w-full flex items-center justify-center mt-2 bg-gray-100 text-black py-2 rounded-md"
                    >
                        <FaPlus className="mr-2" /> 
                        {showAddAddress ? 'Cancel' : 'Add New Address'}
                    </button>
                </div>

                <button 
                    onClick={handleProceedToPayment}
                    className="w-full bg-black text-white h-12 rounded-full hover:bg-gray-900"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default OrderSummaryPage;