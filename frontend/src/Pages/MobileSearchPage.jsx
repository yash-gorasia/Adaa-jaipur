import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosSearch, IoMdClose, IoMdOptions } from 'react-icons/io';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';

const MobileSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    priceRange: 'all',
    category: 'all'
  });

  const userId = localStorage.getItem('userId');

  // Fetch wishlist on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/wishlist/${userId}`);
        const data = await response.json();
        setWishlist(data.wishlistItems || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        showAlert('Failed to fetch wishlist', 'error');
      }
    };

    fetchWishlist();
  }, [userId]);

  // Search products with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchProducts();
      } else {
        setSearchResults([]);
        setFilteredResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, searchResults]);

  const searchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/fetchProducts?keyword=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data);
      setFilteredResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      showAlert('Failed to fetch search results', 'error');
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let results = [...searchResults];

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        results.sort((a, b) => a.CurrentPrice - b.CurrentPrice);
        break;
      case 'price-high-low':
        results.sort((a, b) => b.CurrentPrice - a.CurrentPrice);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      results = results.filter(product => 
        product.CurrentPrice >= min && (max ? product.CurrentPrice <= max : true)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      results = results.filter(product => product.category_id === filters.category);
    }

    setFilteredResults(results);
  };

  const toggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      showAlert('Please login to add items to wishlist', 'error');
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => 
        item.product_id && item.product_id._id === productId
      );

      const endpoint = isInWishlist ? '/api/wishlist/remove' : '/api/wishlist/add';
      const method = isInWishlist ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_id: productId })
      });

      if (response.ok) {
        if (isInWishlist) {
          setWishlist(prev => prev.filter(item => 
            item.product_id && item.product_id._id !== productId
          ));
          showAlert('Removed from wishlist', 'success');
        } else {
          const newItem = await response.json();
          setWishlist(prev => [...prev, newItem]);
          showAlert('Added to wishlist', 'success');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showAlert('Failed to update wishlist', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Search Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3 p-4">
          <IoIosSearch className="text-xl text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-base outline-none"
            autoFocus
          />
          <button onClick={() => setShowFilters(!showFilters)}>
            <IoMdOptions className="text-xl text-gray-600" />
          </button>
          <button onClick={() => navigate(-1)}>
            <IoMdClose className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-4">
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={e => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              >
                <option value="all">All Prices</option>
                <option value="0-1000">Under ₹1,000</option>
                <option value="1000-2000">₹1,000 - ₹2,000</option>
                <option value="2000-5000">₹2,000 - ₹5,000</option>
                <option value="5000">Above ₹5,000</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredResults.map(product => (
              <div
                key={product._id}
                className="group relative"
                onClick={() => navigate('/product', { state: { productId: product._id } })}
              >
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={e => toggleWishlist(product._id, e)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                  >
                    {wishlist.some(item => item.product_id && item.product_id._id === product._id) ? (
                      <HiHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <HiOutlineHeart className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">₹{product.CurrentPrice}</span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-xs text-gray-500 line-through">₹{product.MRP}</span>
                        <span className="text-xs text-green-600">
                          {Math.round(((product.MRP - product.CurrentPrice) / product.MRP) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 && (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div className={`fixed bottom-4 left-4 right-4 p-3 rounded-lg text-center text-white ${
          alertMessage.type === 'success' ? 'bg-black' : 'bg-red-500'
        }`}>
          {alertMessage.message}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;