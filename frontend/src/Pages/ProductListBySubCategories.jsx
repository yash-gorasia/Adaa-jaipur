import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Header from '../Components/Shared/Header';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import { IoFilterOutline } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';
import Alert from '../Components/Shared/Alert';
import NoProduct from '../Images/noproducts.jpeg';
import FloatingChat from '../Components/Shared/Chatbot';
const ProductListBySubCategories = () => {
  const location = useLocation();
  const { Category, SubCategory, categoryId, subcategoryId } = location.state || {};
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [wishlist, setWishlist] = useState([]); // Track wishlisted products
  const [forceUpdate, setForceUpdate] = useState(false);

  // Filter states
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [availableColors, setAvailableColors] = useState([]);

  const userId = localStorage.getItem('userId');
  const loggedIn = localStorage.getItem('isLogin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  const toggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn || !userId) {
      setAlertMessage({ message: 'Please login to add to wishlist.', type: 'error' });
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
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching products by subcategory:', subcategoryId);
        // Fetch products by subcategory
        const productsResponse = await fetch(`/api/products/fetchProductsBySubcategory/${subcategoryId}`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Extract unique colors
        const colors = [...new Set(productsData.map(p => p.color))];
        setAvailableColors(colors);
      } catch (error) {
        console.error(error);
        setError('Error fetching products.');
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) fetchData();
  }, [subcategoryId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        selectedColors.includes(product.color)
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-low-high':
            return a.CurrentPrice - b.CurrentPrice;
          case 'price-high-low':
            return b.CurrentPrice - a.CurrentPrice;
          case 'discount-high-low':
            const discountA = ((a.MRP - a.CurrentPrice) / a.MRP) * 100;
            const discountB = ((b.MRP - b.CurrentPrice) / b.MRP) * 100;
            return discountB - discountA;
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, selectedColors, sortBy]);

  const FilterSection = ({ mobile = false }) => (
    <div className={`space-y-6 ${mobile ? 'p-6' : ''}`}>
      {/* Sort Options */}
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
          <option value="discount-high-low">Discount: High to Low</option>
        </select>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Color</h3>
        <div className="space-y-2">
          {availableColors.map(color => (
            <label key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => {
                  setSelectedColors(prev =>
                    prev.includes(color)
                      ? prev.filter(c => c !== color)
                      : [...prev, color]
                  );
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {mobile && (
        <button
          onClick={() => setShowFilters(false)}
          className="w-full py-3 bg-black text-white"
        >
          Apply Filters
        </button>
      )}
    </div>
  );



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

      {/* Alert Component */}
      {alertMessage && (
        <Alert
          message={alertMessage.message}
          type={alertMessage.type}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto md:mt-[5%]">
        <FloatingChat pageType={"subcategory"} userId={userId} categoryId={categoryId} subCategoryId={subcategoryId} />
        <nav className="flex space-x-2 text-sm text-gray-500">
          <NavLink to="/products" state={{ categoryId }} className="hover:text-gray-900">
            {Category}
          </NavLink>
          <span>/</span>
          <span className="text-gray-900">{SubCategory}</span>
        </nav>
      </div>

      {/* Category Header */}
      <div className="pt-4 pb-4 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900">
              {SubCategory}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {filteredProducts.length} products
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-8">
          {/* Filters Panel - Hidden on mobile */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSection />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <img
                    src={NoProduct}
                    alt="No products found"
                    className="w-40 h-40 mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-900">Oops! No products found.</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Looks like we're fresh out of {SubCategory.toLowerCase()}... Time to explore something new!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="group relative ">
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
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity">
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                            </div>
                          </div>
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
            <FilterSection mobile />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListBySubCategories;