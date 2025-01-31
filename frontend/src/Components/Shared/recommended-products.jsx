import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecommendedProducts = ({ categoryId, currentproductid }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await fetch(`/api/products/fetchProductsByCategory/${categoryId}`);
        if (!response.ok) throw new Error('Failed to fetch recommended products');

        const data = await response.json();
        setRecommendedProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRecommendedProducts();
    }
  }, [categoryId]);

  // Filter out the current product from the recommended products
  const filteredProducts = recommendedProducts.filter(
    (product) => product._id !== currentproductid
  );

  // If loading or no recommended products (after filtering), return null
  if (loading || filteredProducts.length === 0) return null;

  return (
    <div className=" py-4 mb-8">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl text-gray-800 tracking-tight">
          Recommended for You
        </h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="group hover:shadow-lg cursor-pointer overflow-hidden"
            onClick={() => navigate('/product', { state: { productId: product._id } })}
          >
            {/* Product Image */}
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                loading="lazy"
              />
              {product.discount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-sm">
                  {Math.round((1 - product.CurrentPrice / product.MRP) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm text-gray-800 group-hover:text-gray-900 truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-900">
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

export default RecommendedProducts;