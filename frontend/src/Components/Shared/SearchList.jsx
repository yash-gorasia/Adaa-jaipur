import React, { useEffect, useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import Header from "../Shared/Header";
import { IoFilterOutline, IoClose } from 'react-icons/io5';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import Alert from '../Shared/Alert'; // Assuming you have an Alert component
import NoProduct from "../../Images/noproducts.jpeg"; // Replace with your no-product image
import { IoIosSearch } from 'react-icons/io';

const SearchList = () => {
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const { searchQuery: initialSearchQuery } = location.state || {};
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [wishlist, setWishlist] = useState([]); // Track wishlisted products
  const [forceUpdate, setForceUpdate] = useState(false);

  // Fetch search results from the backend
  useEffect(() => {
    if (searchQuery) {
      fetch(`/api/products/fetchProducts?keyword=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
          setSearchResults(data);
          setFilteredResults(data);
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
          setAlertMessage({ message: 'Failed to fetch search results.', type: 'error' });
        });
    }
  }, [searchQuery]);

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`/api/wishlist/${userId}`);
        const data = await response.json();
        setWishlist(data.wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setAlertMessage({ message: 'Failed to fetch wishlist.', type: 'error' });
      }
    };

    if (userId) {
      fetchWishlist();
    }
  }, [userId, forceUpdate]); // Add forceUpdate as a dependency

  // Update filtered results when searchResults or sortBy changes
  useEffect(() => {
    let sortedResults = [...searchResults];
    if (sortBy === 'price-low-high') {
      sortedResults.sort((a, b) => a.CurrentPrice - b.CurrentPrice);
    } else if (sortBy === 'price-high-low') {
      sortedResults.sort((a, b) => b.CurrentPrice - a.CurrentPrice);
    }
    setFilteredResults(sortedResults);
  }, [sortBy, searchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.search.value);
  };

  const toggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if(!userId) {
      setAlertMessage({ message: 'Please login to add to wishlist', type: 'error' });
      return;
    }
  
    try {
      const isInWishlist = wishlist.some(
        (item) => item.product_id && item.product_id._id === productId
      );
  
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId }),
        });
  
        if (response.ok) {
          setWishlist((prev) =>
            prev.filter((item) => item.product_id && item.product_id._id !== productId)
          );
          setAlertMessage({ message: 'Removed from wishlist!', type: 'success' });
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId }),
        });
  
        if (response.ok) {
          const newWishlistItem = await response.json();
  
          // Add to wishlist state
          setWishlist((prev) => [...prev, newWishlistItem]);
  
          // Update the button color immediately
          setAlertMessage({ message: 'Added to wishlist!', type: 'success' });
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setAlertMessage({ message: 'Failed to update wishlist.', type: 'error' });
    }
    setForceUpdate(!forceUpdate); // Trigger re-render
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

      {/* Search Header */}
      <div className="pt-20 pb-4 px-4 max-w-7xl mx-auto md:mt-[5%]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900">
              Search Results for "{searchQuery}"
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {filteredResults.length} products
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-full hover:border-gray-400"
          >
            <IoFilterOutline size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={searchQuery}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              aria-label="Search products"
            />
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoIosSearch className="text-gray-400" />
            </span>
          </div>
          <button
            type="submit"
            className="ml-2 p-2 bg-black  text-white rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            aria-label="Submit search"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-8">
          {/* Filters Panel - Hidden on mobile */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md"
                  >
                    <option value="">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96">
                <img
                  src={NoProduct}
                  alt="No products found"
                  className="w-32 h-32 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-900">Oops! No products found.</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Looks like we're fresh out of <b>{searchQuery.toLowerCase()}...</b> Time to explore something new!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {filteredResults.map((product) => (
                  <div key={product._id} className="group relative">
                    {/* Wishlist Button */}
                    <button
                      className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      onClick={(e) => toggleWishlist(product._id, e)}
                    >
                      {wishlist.some((item) => item.product_id && item.product_id._id === product._id) ? (
                        <HiHeart size={20} className="text-red-500" />
                      ) : (
                        <HiOutlineHeart size={20} className="text-black" />
                      )}
                    </button>

                    {/* Product Image */}
                    <NavLink to="/product" state={{ productId: product._id }}>
                      <div className="relative aspect-[3/4] mb-4 bg-gray-100">
                        <img
                          src={product.image[0].replace("'\'", "/")}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                      </div>
                    </NavLink>

                    {/* Product Info */}
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <IoClose size={24} />
              </button>
            </div>
            <div className="p-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md"
                >
                  <option value="">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchList;