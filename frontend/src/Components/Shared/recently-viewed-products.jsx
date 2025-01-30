import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getViewedProducts } from './product-storage-utils';

const RecentlyViewedProducts = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const viewedProductIds = getViewedProducts();

        if (viewedProductIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch details for each viewed product
        const productPromises = viewedProductIds.map(async (item) => {
          const response = await fetch(`/api/products/fetchProductById/${item.productId}`);
          if (!response.ok) throw new Error('Failed to fetch product');
          return response.json();
        });

        const productDetails = await Promise.all(productPromises);
        setRecentProducts(productDetails.map((p) => p.product));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  if (loading || recentProducts.length === 0) return null;

  return (
    <div className="py-12 bg-gray-50">
      {/* Unique heading style */}
      <div className="text-center mb-10">
        <h2 className="text-4xl  text-gray-900 tracking-tight" >
          Recently Viewed
        </h2>
      </div>
      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {recentProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => navigate('/product', { state: { productId: product._id } })}
            className="group overflow-hidden cursor-pointer transition-all hover:scale-105"
          >
            {/* Product Image */}
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
              {product.discount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs  px-2 py-1 rounded-sm">
                  {product.discount}% OFF
                </div>
              )}
            </div>
            {/* Product Details */}
            <div className="pt-4 space-y-2" >
              {/* Full product name */}
              <h3 className="text-lg medium text-gray-900 group-hover:text-gray-700">
                {product.name}
              </h3>
              {/* Price Section */}
              <div className="flex items-center space-x-2">
                <span className="text-lg  ld text-gray-900">
                  ₹{product.CurrentPrice}
                </span>
                {product.MRP && product.MRP > product.CurrentPrice && (
                  <span className="text-sm line-through text-gray-500">
                    ₹{product.MRP}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;
