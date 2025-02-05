import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MdError } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Footer from '../Components/Shared/Footer';

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/getAllCategories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setCategories(data);
        } catch (jsonError) {
          console.error("Failed to parse JSON:", jsonError);
          setError('Invalid JSON format received');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <MdError className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 md:mb-[0%] mb-[12%]">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Our Stunning Collections
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <NavLink
              key={category._id}
              to="/productlist"
              state={{ categoryId: category._id }}
              className="block group"
            >
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-500 hover:scale-105"
                style={{
                  animation: `fadeInUp 0.7s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={category.imageurl}
                      alt={category.category_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100">
                  <h2 className="text-lg font-medium text-gray-900 text-center">
                    {category.category_name}
                  </h2>
                  <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default CategoryGrid;
