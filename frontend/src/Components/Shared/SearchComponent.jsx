import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";

const SearchComponent = ({ onClose }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`/api/wishlist/${userId}`);
          const data = await response.json();
          setWishlistItems(data.map(item => item.product_id));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length > 0) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/products/fetchProducts?keyword=${searchTerm}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const toggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      if (wishlistItems.includes(productId)) {
        await fetch('/api/wishlist/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        setWishlistItems(wishlistItems.filter(id => id !== productId));
      } else {
        await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        setWishlistItems([...wishlistItems, productId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsSearchOpen(true)} className="text-3xl">
        <IoIosSearch />
      </button>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Search Header */}
            <div className="sticky top-0 bg-white py-4 z-10">
              <div className="flex items-center gap-4 border-b-2 border-gray-200 pb-4">
                <IoIosSearch className="text-2xl text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-lg outline-none"
                  autoFocus
                />
                <button onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm('');
                  setSuggestions([]);
                  onClose();
                }} className="text-2xl">
                  <IoMdClose />
                </button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm text-gray-500">{suggestions.length} products found</p>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {suggestions.length > 0 ? (
              <div className="py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                  {suggestions.map((product) => (
                    <div key={product._id} className="group">
                      <NavLink to="/product" state={{ productId: product._id }}>
                        <div className="relative aspect-[3/4] mb-4 bg-gray-100">
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity">
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="mx-1 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                onClick={(e) => toggleWishlist(product._id, e)}
                              >
                                {wishlistItems.includes(product._id) ? (
                                  <HiHeart size={20} className="text-red-500" />
                                ) : (
                                  <HiOutlineHeart size={20} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </NavLink>

                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{product.CurrentPrice}
                          </p>
                          {product.discount > 0 && (
                            <>
                              <p className="text-xs text-gray-500 line-through">
                                ₹{product.MRP}
                              </p>
                              <p className="text-xs text-green-600">
                                {Math.round(((product.MRP - product.CurrentPrice) / product.MRP) * 100)}% OFF
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm && (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="text-xl font-semibold text-gray-900">No products found</div>
                <p className="text-sm text-gray-500 mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;