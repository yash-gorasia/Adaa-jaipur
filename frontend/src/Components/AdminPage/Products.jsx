import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Tag, DollarSign, Trash2, Edit2, ChevronDown,Plus } from 'lucide-react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const navigate = useNavigate();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products/fetchAllProducts");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Delete a product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/removeProduct/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Redirect to edit page
  const handleEdit = (id) => {
    navigate(`/admin/product/${id}`);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (filterBy === "all") return true;
      return product.category_id === filterBy;
    })
    .filter((product) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.styleCode.toLowerCase().includes(lowerCaseQuery)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.CurrentPrice - b.CurrentPrice;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "discount") return b.discount - a.discount;
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="min-h-screen mt-8 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-500">Manage and organize your product inventory</p>
        </div>
        <button
            onClick={() => navigate("/admin/products/create")}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Create Product
          </button>
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or style code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="discount">Sort by Discount</option>
                <option value="newest">Sort by Newest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product._id}
              className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Image Section */}
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag size={16} className="mr-2" />
                    Style Code: {product.styleCode}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-900">RS{product.CurrentPrice}</span>
                      {product.discount > 0 && (
                        <span className="ml-2 text-gray-400 line-through">RS{product.MRP}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;