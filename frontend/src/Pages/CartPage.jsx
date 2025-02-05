import React, { useEffect, useState } from 'react';
import { HiOutlineShoppingBag, HiOutlineTrash } from 'react-icons/hi';
import Header from '../Components/Shared/Header';
import Alert from '../Components/Shared/Alert';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [itemWarnings, setItemWarnings] = useState({}); // Track warnings for each item
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch cart items
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                if (!userId) {
                    throw new Error('User not logged in');
                }

                const cartResponse = await fetch(`/api/cart/fetchCartItemsByUserId/${userId}`);
                if (!cartResponse.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const cartData = await cartResponse.json();
                setCartItems(cartData);

                // Check stock availability for each item and set warnings
                const warnings = {};
                cartData.forEach((item) => {
                    const availableStock = item.product_id.sizes.find((size) => size.size === item.size)?.stock || 0;
                    if (item.quantity > availableStock) {
                        warnings[item._id] = `Only ${availableStock} items available in this size`;
                    }
                });
                setItemWarnings(warnings);
            } catch (err) {
                console.error('Error fetching cart items:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [userId]);

    // Calculate totals
    const calculateTotals = () => {
        let totalPrice = 0;
        let totalDiscount = 0;

        cartItems.forEach((item) => {
            const product = item.product_id;
            totalPrice += product.CurrentPrice * item.quantity;
            totalDiscount += (product.MRP - product.CurrentPrice) * item.quantity;
        });

        const finalPrice = totalPrice;

        return { totalPrice, totalDiscount, finalPrice };
    };

    const { totalPrice, totalDiscount, finalPrice } = calculateTotals();

    // Check if any item in the cart exceeds available stock
    const isCartValid = cartItems.every((item) => {
        const availableStock = item.product_id.sizes.find((size) => size.size === item.size)?.stock || 0;
        return item.quantity <= availableStock;
    });

    // Handle Place Order
    const handlePlaceOrder = () => {
        if (cartItems.length === 0) {
            setAlertMessage({ message: 'Your cart is empty.', type: 'error' });
            return;
        }

        if (!isCartValid) {
            setAlertMessage({ message: 'Some items in your cart exceed available stock. Please update your cart.', type: 'error' });
            return;
        }

        // Navigate to CheckoutPage with cart items and total amount
        navigate('/checkout', {
            state: {
                cartItems,
                totalAmount: finalPrice,
            },
        });
    };

    // Remove item from cart
    const removeFromCart = async (cartItemId) => {
        try {
            const response = await fetch(`/api/cart/deleteCartItem/${cartItemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }
            window.dispatchEvent(new Event('cartUpdated'));

            // Update the cart items state
            setCartItems((prevItems) => prevItems.filter((item) => item._id !== cartItemId));
            setAlertMessage({ message: 'Item removed from cart', type: 'success' });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            setAlertMessage({ message: 'Failed to remove item from cart', type: 'error' });
        }
    };

    // Update quantity of a cart item
    const updateQuantity = async (cartItemId, newQuantity) => {
        const item = cartItems.find((item) => item._id === cartItemId);
        const availableStock = item.product_id.sizes.find((size) => size.size === item.size)?.stock || 0;

        if (newQuantity > availableStock) {
            setItemWarnings((prevWarnings) => ({
                ...prevWarnings,
                [cartItemId]: `Only ${availableStock} items available in this size`,
            }));
            return;
        }

        try {
            const response = await fetch(`/api/cart/updateCartItem/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            // Update the cart items state
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item._id === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );

            // Clear the warning for this item
            setItemWarnings((prevWarnings) => ({
                ...prevWarnings,
                [cartItemId]: null,
            }));
        } catch (error) {
            console.error('Error updating quantity:', error);
            setAlertMessage({ message: 'Failed to update quantity', type: 'error' });
        }
    };

    // Update size of a cart item
    const updateSize = async (cartItemId, newSize) => {
        try {
            const response = await fetch(`/api/cart/updateCartItem/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ size: newSize }),
            });

            if (!response.ok) {
                throw new Error('Failed to update size');
            }

            // Update the cart items state
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item._id === cartItemId ? { ...item, size: newSize } : item
                )
            );
        } catch (error) {
            console.error('Error updating size:', error);
            setAlertMessage({ message: 'Failed to update size', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header transparent={false} />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header transparent={false} />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="text-lg text-gray-800">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header transparent={false} />

            {/* Alert Message */}
            {alertMessage && (
                <Alert
                    message={alertMessage.message}
                    type={alertMessage.type}
                    onClose={() => setAlertMessage(null)}
                />
            )}

            <div className="max-w-7xl mb-[12%] md:mb-[0%] mx-auto px-4 md:px-8 py-6 md:py-12 md:mt-[5%]">
                <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-8">Your Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-500">Looks like your cart is on a diet. Time to feed it!</p>
                        <Link to="/" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {cartItems.map((item) => {
                                const product = item.product_id;
                                const availableSizes = product.sizes;
                                const warning = itemWarnings[item._id];

                                return (
                                    <div key={item._id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-b border-gray-200 py-4 sm:py-6">
                                        {/* Product Image */}
                                        <div className="w-24 h-32 sm:w-40 sm:h-56 flex-shrink-0">
                                            <img
                                                src={product.image[0].replace("'\'", "/")}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h2 className="text-base sm:text-lg font-medium text-gray-900">{product.name}</h2>

                                            {/* Size Selector */}
                                            <div className="mt-2 sm:mt-4">
                                                <label className="text-xs sm:text-sm text-gray-500">Size:</label>
                                                <select
                                                    value={item.size}
                                                    onChange={(e) => updateSize(item._id, e.target.value)}
                                                    className="ml-2 p-1 border border-gray-200 rounded-md text-xs sm:text-sm"
                                                >
                                                    {availableSizes.map((size) => (
                                                        <option key={size._id} disabled={size.stock == 0} value={size.size}>
                                                            {size.size}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Quantity Selector */}
                                            <div className="mt-2 sm:mt-4">
                                                <label className="text-xs sm:text-sm text-gray-500">Quantity:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={availableSizes.find((size) => size.size === item.size)?.stock || 1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                                                    className="ml-2 p-1 border border-gray-200 rounded-md text-xs sm:text-sm w-16"
                                                />
                                            </div>

                                            {/* Price and Discount */}
                                            <div className="mt-2 sm:mt-4">
                                                <span className="text-sm sm:text-lg font-light">₹{product.CurrentPrice}</span>
                                                {product.discount > 0 && (
                                                    <>
                                                        <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">₹{product.MRP}</span>
                                                        <span className="text-xs sm:text-sm text-green-600 ml-1 sm:ml-2">
                                                            {Math.round(((product.MRP - product.CurrentPrice) / product.MRP) * 100)}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Warning Message */}
                                            {warning && (
                                                <div className="text-red-500 text-xs sm:text-sm mt-2">
                                                    {warning}
                                                </div>
                                            )}

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm text-gray-500 hover:text-gray-900"
                                            >
                                                <HiOutlineTrash size={16} className="mr-1 sm:mr-2" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 mt-6 sm:mt-8 lg:mt-0">
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                                {/* Totals */}
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-500">Total Price</span>
                                        <span className="text-sm sm:text-base text-gray-900">₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm sm:text-base text-gray-500">Total Discount</span>
                                        <span className="text-sm sm:text-base text-green-600">-₹{totalDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3 sm:pt-4">
                                        <span className="text-base sm:text-lg font-medium text-gray-900">Final Price</span>
                                        <span className="text-base sm:text-lg font-medium text-gray-900">₹{finalPrice.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-black text-white h-10 sm:h-12 px-4 sm:px-6 mt-4 sm:mt-6 rounded-full hover:bg-gray-900 transition-colors text-sm sm:text-base"
                                    disabled={!isCartValid}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;