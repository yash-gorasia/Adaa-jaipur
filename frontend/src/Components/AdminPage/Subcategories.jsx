import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';

const SubcategoriesManagement = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('subcategory_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    subcategory_name: '',
    category_id: ''
  });
  const [error, setError] = useState(null);

  // Fetch subcategories and categories
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories/getAllSubcategories');
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setError(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/getAllCategories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let response;
      if (isEditing) {
        
        // Use the specific route and parameter name from the controller
        response = await fetch(`/api/subcategories/updateSubcategory/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subcategory_name: formData.subcategory_name 
          })
        });
      } else {
        response = await fetch('/api/subcategories/createSubcategory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subcategory_name: formData.subcategory_name,
            category_id: formData.category_id
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }

      fetchSubcategories();
      resetForm();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await fetch(`/api/subcategories/deleteSubcategory/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete subcategory');
        }

        fetchSubcategories();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        setError(error.message);
      }
    }
  };

  const startEditing = (subcategory) => {
    setIsEditing(true);
    // Only set the ID for editing
    setEditingId(subcategory._id);
    setFormData({
      subcategory_name: subcategory.subcategory_name,
      category_id: subcategory.category_id?._id || subcategory.category_id
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ subcategory_name: '', category_id: '' });
    setError(null);
  };

  const filteredSubcategories = subcategories
    .filter(sub => {
      const matchesSearch = sub.subcategory_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        (sub.category_id?._id || sub.category_id) === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = sortField === 'subcategory_name' 
        ? a.subcategory_name 
        : (a.category_id?.category_name || 'Unknown');
      const bValue = sortField === 'subcategory_name' 
        ? b.subcategory_name 
        : (b.category_id?.category_name || 'Unknown');
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Subcategories Management</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Subcategory Name"
              value={formData.subcategory_name}
              onChange={(e) => setFormData({ ...formData, subcategory_name: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-black"
              required
            />
          </div>
          {!isEditing && (
            <div className="flex-1">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-black"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button 
            type="submit" 
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Filters and Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:border-black"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:border-black"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => {
                  setSortField('subcategory_name');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Subcategory Name
              </th>
              <th
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => {
                  setSortField('category_name');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Category
              </th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubcategories.map(subcategory => (
              <tr key={subcategory._id} className="border-t">
                <td className="px-6 py-4">{subcategory.subcategory_name}</td>
                <td className="px-6 py-4">
                  {subcategory.category_id?.category_name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => startEditing(subcategory)}
                    className="text-gray-600 hover:text-black mr-4"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(subcategory._id)}
                    className="text-gray-600 hover:text-black"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubcategoriesManagement;