// Frontend: src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Components/Shared/Header';
import Alert from '../Components/Shared/Alert';
import { FaLock, FaCreditCard, FaTrash } from 'react-icons/fa';
import dropin from 'braintree-web-drop-in';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [braintreeInstance, setBraintreeInstance] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [savedCards, setSavedCards] = useState([]);
    const [showNewCardForm, setShowNewCardForm] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);

    const {
        cartItems = [],
        totalAmount = 0,
        selectedAddress,
        estimatedDeliveryDate
    } = location.state || {};

    const [alertMessage, setAlertMessage] = useState(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [saveCard, setSaveCard] = useState(false);

    const userId = localStorage.getItem('userId');

    const initializeBraintree = async () => {
        try {
            const response = await fetch('/api/payment/client_token');
            const clientToken = await response.json();

            dropin.create({
                authorization: clientToken,
                container: '#braintree-drop-in-container' // Corrected ID
            }, (error, instance) => {
                if (error) {
                    console.error(error);
                } else {
                    setBraintreeInstance(instance);
                }
            });

        } catch (error) {
            console.error('Error initializing Braintree:', error);
            setAlertMessage({
                message: 'Failed to initialize payment gateway',
                type: 'error'
            });
        }
    };



    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`/api/users/getuserbyid/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user details');
                
                const userData = await response.json();
                setUserDetails(userData.user);
                if (userData.user.savedCards?.length > 0) {
                    setSavedCards(userData.user.savedCards);
                    setShowNewCardForm(false);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                setAlertMessage({
                    message: 'Failed to fetch user details',
                    type: 'error'
                });
            }
        };

        fetchUserDetails();
    }, [userId]);

    useEffect(() => {
        if (showNewCardForm) {
            initializeBraintree();
        }
    }, [showNewCardForm]);

    const handleDeleteCard = async (cardId) => {
        try {
            const response = await fetch(`/api/users/${userId}/deletecard/${cardId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete card');

            setSavedCards(savedCards.filter(card => card._id !== cardId));
            setAlertMessage({
                message: 'Card deleted successfully',
                type: 'success'
            });

            if (savedCards.length === 1) {
                setShowNewCardForm(true);
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            setAlertMessage({
                message: 'Failed to delete card',
                type: 'error'
            });
        }
    };

    const handlePlaceOrder = async () => {
        setIsPaymentProcessing(true);
        try {
            let paymentMethodNonce;
            let paymentDetails;

            if (selectedCard) {
                // Use saved card
                paymentMethodNonce = selectedCard.token;
                paymentDetails = {
                    cardType: selectedCard.cardType,
                    lastFour: selectedCard.lastFour,
                    expirationDate: selectedCard.expirationDate
                };
            } else {
                // Use new card
                if (!braintreeInstance) {
                    throw new Error('Payment gateway not initialized');
                }
                const { nonce, details } = await braintreeInstance.requestPaymentMethod();
                paymentMethodNonce = nonce;
                paymentDetails = {
                    cardType: details.cardType,
                    lastFour: details.lastFour,
                    expirationDate: details.expirationDate
                };
            }

            const orderPayload = {
                user_id: userId,
                total_amount: totalAmount,
                payment_method_nonce: paymentMethodNonce,
                delivery_address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.postalCode}, ${selectedAddress.country}`,
                paymentmode: 'braintree',
                paymentDetails
            };
            console.log("orderPayload",orderPayload);
            const orderResponse = await fetch('/api/orders/createOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) {
                throw new Error(orderData.details || orderData.message);
            }

            // Process order items
            await Promise.all(cartItems.map(async (item) => {
                // Add order item
                await fetch('/api/orderItems/addOrderItem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: orderData._id,
                        product_id: item.product_id._id,
                        quantity: item.quantity,
                        price: item.product_id.CurrentPrice,
                        size: item.size
                    })
                });

                // Update stock
                await fetch('/api/products/updateProductStock', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.product_id._id,
                        size: item.size,
                        quantity: item.quantity
                    })
                });
            }));

            // Clear cart
            await fetch(`/api/cart/clearCart/${userId}`, {
                method: 'DELETE'
            });

            // Save new card if requested
            if (saveCard && !selectedCard) {
                await fetch(`/api/users/addcard/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...paymentDetails,
                        token: paymentMethodNonce
                    })
                });
            }
            window.dispatchEvent(new Event('cartUpdated'));

            navigate('/payment-success', {
                state: {
                    orderId: orderData._id,
                    estimatedDeliveryDate
                }
            });
        } catch (error) {
            console.error('Order placement error:', error);
            const errorMessage = error.message.includes('Do Not Honor') 
                ? 'Your card was declined. Please try a different card.'
                : error.message;
            
            setAlertMessage({
                message: errorMessage,
                type: 'error'
            });

            if (error.message.includes('Cannot use a payment_method_nonce more than once')) {
                await initializeBraintree();
            }
        } finally {
            setIsPaymentProcessing(false);
        }
    };

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
                <h1 className="text-2xl font-light mb-8">Payment</h1>

                {/* Order Summary */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Total Items</span>
                            <span>{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated Delivery</span>
                            <span>
                                {estimatedDeliveryDate
                                    ? new Date(estimatedDeliveryDate).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Saved Cards Section */}
                {savedCards.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-medium mb-4">Saved Cards</h2>
                        <div className="space-y-4">
                            {savedCards.map((card) => (
                                <div
                                    key={card._id}
                                    className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                                        selectedCard?._id === card._id ? 'border-black' : 'border-gray-200'
                                    }`}
                                    onClick={() => {
                                        setSelectedCard(card);
                                        setShowNewCardForm(false);
                                    }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <FaCreditCard className="text-gray-600" />
                                        <div>
                                            <p className="font-medium">
                                                {card.cardType} ending in {card.lastFour}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Expires {card.expirationDate}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCard(card._id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setShowNewCardForm(true);
                                    setSelectedCard(null);
                                }}
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
                            >
                                + Add New Card
                            </button>
                        </div>
                    </div>
                )}

                {/* Braintree Drop-in UI */}
                {showNewCardForm && (
                    <>
                        <div id="braintree-drop-in-container" className="mb-4"></div>
                        <label className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                checked={saveCard}
                                onChange={(e) => setSaveCard(e.target.checked)}
                                className="mr-2"
                            />
                            Save card for future payments
                        </label>
                    </>
                )}

                {/* Secure Payment Indicator */}
                <div className="flex items-center justify-center my-6">
                    <FaLock className="mr-2 text-gray-600" />
                    <span className="text-gray-600">Secure Payment</span>
                </div>

                {/* Place Order Button */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={isPaymentProcessing}
                    className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPaymentProcessing ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            <span className="ml-2">Processing Payment...</span>
                        </div>
                    ) : (
                        'Place Order'
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
