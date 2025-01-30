import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdError } from 'react-icons/md';
import { motion } from 'framer-motion';

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowedCategories = ['Bottoms', 'Gowns', 'Kurta Set', 'Kurta', 'Tops'];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/getAllCategories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        const filteredCategories = data.filter((category) =>
          allowedCategories.includes(category.category_name)
        );
        setCategories(filteredCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white">
        <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-white">
        <MdError className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Shop by Category
        </h1>

        {/* Desktop: Static Carousel with Floating Hover Animation */}
        <div className="hidden md:flex w-full justify-center items-center h-[300px] relative overflow-hidden gap-4">
          {categories.map((category) => (
            <motion.div
              key={category._id}
              className="flex-shrink-0 w-60 h-60 rounded-full overflow-hidden shadow-lg cursor-pointer relative"
              whileHover={{
                y: -20,
                scale: 1.1,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 172, 0.3)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <NavLink
                to="/productlist"
                state={{ categoryId: category._id }}
                className="block w-full h-full"
              >
                <img
                  src={category.imageurl}
                  alt={category.category_name}
                  className="absolute inset-0 w-full h-full object-cover "
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg  text-center">
                    {category.category_name}
                  </span>
                </div>
              </NavLink>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto pb-4 hide-scrollbar gap-4 px-4">
          {categories.map((category) => (
            <NavLink
              key={category._id}
              to="/productlist"
              state={{ categoryId: category._id }}
              className="flex-shrink-0 w-32 group"
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
                <img
                  src={category.imageurl}
                  alt={category.category_name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-black/40 p-2">
                  <span className="text-white font-semibold text-sm text-center">
                    {category.category_name}
                  </span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ShopByCategory;