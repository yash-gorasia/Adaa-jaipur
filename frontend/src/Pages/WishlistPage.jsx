import React, { useEffect, useState } from 'react';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Shared/Header';
import Alert from '../Components/Shared/Alert';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null); // State for alert message
  const [selectedSize, setSelectedSize] = useState({}); // State to track selected size for each product
  const [quantity, setQuantity] = useState({}); // State to track quantity for each product
  const userid = localStorage.getItem('userId');
  const loggedIn = localStorage.getItem('isLogin');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`/api/wishlist/${userid}`);
        const data = await response.json();
        setWishlistItems(data.wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    if (userid) fetchWishlist();
  }, [userid]);

  const removeFromWishlist = async (productId) => {
    if (!loggedIn) {
      setAlertMessage({ message: 'Please login to manage your wishlist.', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userid, product_id: productId }),
      });

      if (response.ok) {
        setWishlistItems((prevItems) =>
          prevItems.filter((item) => item.product_id._id !== productId)
        );
        setAlertMessage({ message: 'Product removed from wishlist successfully', type: 'success' });
      } else {
        const errorData = await response.json();
        setAlertMessage({ message: errorData.message || 'Failed to remove product from wishlist', type: 'error' });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setAlertMessage({ message: 'Server error. Please try again later.', type: 'error' });
    }
  };

  const handleBuyNow = (product) => {
    if (!loggedIn) {
      setAlertMessage({ message: 'Please login to proceed to buy.', type: 'error' });
      return;
    }

    const selectedSizeForProduct = selectedSize[product._id];
    const quantityForProduct = quantity[product._id] || 1;

    if (!selectedSizeForProduct) {
      setAlertMessage({ message: 'Please select a size.', type: 'error' });
      return;
    }

    const selectedSizeData = product.sizes.find(size => size.size === selectedSizeForProduct);
    if (!selectedSizeData || selectedSizeData.stock === 0) {
      setAlertMessage({ message: 'Selected size is out of stock.', type: 'error' });
      return;
    }

    if (quantityForProduct > selectedSizeData.stock) {
      setAlertMessage({ message: `Only ${selectedSizeData.stock} items available in this size.`, type: 'error' });
      return;
    }

    const cartItems = [{
      product_id: product,
      quantity: quantityForProduct,
      size: selectedSizeForProduct,
    }];

    const totalAmount = product.CurrentPrice * quantityForProduct;

    navigate('/order-summary', { state: { cartItems, totalAmount } });
  };

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    if (!loggedIn) {
      setAlertMessage({ message: 'Please login to add to cart', type: 'error' });
      return;
    }

    const product = wishlistItems.find(item => item.product_id._id === productId);

    if (!product) {
      setAlertMessage({ message: 'Product not found', type: 'error' });
      return;
    }

    const selectedSizeForProduct = selectedSize[productId];
    const quantityForProduct = quantity[productId] || 1;

    if (!selectedSizeForProduct) {
      setAlertMessage({ message: 'Please select a size.', type: 'error' });
      return;
    }

    const selectedSizeData = product.product_id.sizes.find(size => size.size === selectedSizeForProduct);
    if (!selectedSizeData || selectedSizeData.stock === 0) {
      setAlertMessage({ message: 'Selected size is out of stock.', type: 'error' });
      return;
    }

    if (quantityForProduct > selectedSizeData.stock) {
      setAlertMessage({ message: `Only ${selectedSizeData.stock} items available in this size.`, type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/cart/addToCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userid,
          product_id: productId,
          quantity: quantityForProduct,
          size: selectedSizeForProduct,
        }),
      });

      if (response.ok) {
        setAlertMessage({ message: 'Product added to cart', type: 'success' });
        window.dispatchEvent(new Event('cartUpdated'));

      } else {
        const errorData = await response.json();
        setAlertMessage({ message: errorData.message || 'Failed to add product to cart', type: 'error' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAlertMessage({ message: 'Server error. Please try again later.', type: 'error' });
    }
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSize(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantity(prev => ({ ...prev, [productId]: newQuantity }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header transparent={false} />

      {/* Alert Component */}
      {alertMessage && (
        <Alert
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="max-w-7xl md:mt-[5%] mx-auto px-4 md:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-4">Your Wishlist</h2>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div key={item._id} className="group">
                {/* Product Image */}
                <div className="relative aspect-[3/4] mb-4 bg-gray-100">
                  <img
                    src={item.product_id.image[0].replace("'\'", "/")}
                    alt={item.product_id.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromWishlist(item.product_id._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <HiOutlineTrash size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.product_id.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {item.product_id.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{item.product_id.CurrentPrice}
                    </p>
                    {item.product_id.discount > 0 && (
                      <>
                        <p className="text-xs text-gray-500 line-through">
                          ₹{item.product_id.MRP}
                        </p>
                        <p className="text-xs text-green-600">
                          {Math.round(((item.product_id.MRP - item.product_id.CurrentPrice) / item.product_id.MRP) * 100)}% OFF
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mt-2">
                  <label className="text-sm font-medium text-gray-700">Size:</label>
                  <select
                    value={selectedSize[item.product_id._id] || ''}
                    onChange={(e) => handleSizeChange(item.product_id._id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Size</option>
                    {item.product_id.sizes.map((size) => (
                      <option 
                        key={size.size} 
                        value={size.size} 
                        disabled={size.stock === 0}
                      >
                        {size.size} {size.stock === 0 ? '(Out of Stock)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Selection */}
                <div className="mt-2">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={
                      selectedSize[item.product_id._id]
                        ? item.product_id.sizes.find(size => size.size === selectedSize[item.product_id._id]).stock
                        : 1
                    }
                    value={quantity[item.product_id._id] || 1}
                    onChange={(e) => handleQuantityChange(item.product_id._id, parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                  {loggedIn ? (
                    <>
                      <button 
                        onClick={() => handleBuyNow(item.product_id)} 
                        className="py-1 px-2 sm:py-2 sm:px-4 bg-black text-white rounded-md text-xs sm:text-sm"
                      >
                        Buy Now
                      </button>
                      <button 
                        onClick={(e) => addToCart(item.product_id._id, e)} 
                        className="py-1 px-2 sm:py-2 sm:px-4 border border-black rounded-md text-xs sm:text-sm"
                      >
                        Add to Cart
                      </button>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      Please login to add to cart or buy now.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">No items in your wishlist? Don’t worry, dreams take time!</p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;