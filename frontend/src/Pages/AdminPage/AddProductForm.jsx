import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProductForm = () => {
  const navigate = useNavigate();
  
  const [product, setProduct] = useState({
    name: "",
    styleCode: "",
    description: "",
    MRP: "",
    discount: "",
    CurrentPrice: "",
    category_id: "",
    subcategory_id: "",
    color: "",
    FabricCare: "",
    Pattern: "",
    type: "",
    Fabric: "",
    lengthType: "",
    idealFor: "",
    style: "",
    neck: "",
    sleeve: "",
    is_active: true,
    sizes: [{ size: "Small", stock: 0 }],
    tags: ""
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetch("/api/categories/getAllCategories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    if (product.category_id) {
      fetch(`/api/subCategories/getSubcategoriesByCategory/${product.category_id}`)
        .then((res) => res.json())
        .then((data) => setSubcategories(data))
        .catch((error) => console.error("Error fetching subcategories:", error));
    }
  }, [product.category_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      CurrentPrice: name === "MRP" || name === "discount" ? 
        calculateCurrentPrice(
          name === "MRP" ? value : prev.MRP,
          name === "discount" ? value : prev.discount
        ) : prev.CurrentPrice,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Append all product data
    Object.keys(product).forEach(key => {
      if (key === 'sizes') {
        formData.append('sizes', JSON.stringify(product.sizes));
      } else if (key === 'subcategory_id') {
        // Only append subcategory_id if it has a value
        if (product.subcategory_id) {
          formData.append('subcategory_id', product.subcategory_id);
        }
      } else {
        formData.append(key, product[key]);
      }
    });
    // Append images
    selectedFiles.forEach(file => {
      formData.append('image', file);
    });

    try {
      const response = await fetch("/api/products/addProduct", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      navigate("/admin");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...product.sizes];
    updatedSizes[index][field] = value;
    setProduct({ ...product, sizes: updatedSizes });
  };

  const addSize = () => {
    setProduct({ ...product, sizes: [...product.sizes, { size: "Small", stock: 0 }] });
  };

  const removeSize = (index) => {
    const updatedSizes = product.sizes.filter((_, i) => i !== index);
    setProduct({ ...product, sizes: updatedSizes });
  };

  const calculateCurrentPrice = (mrp, discount) => {
    const numericMrp = Number(mrp) || 0;
    const numericDiscount = Number(discount) || 0;
    const discountAmount = (numericMrp * numericDiscount) / 100;
    return (numericMrp - discountAmount).toFixed(2);
  };

  const cleanupPreviews = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  };

  useEffect(() => {
    return () => cleanupPreviews();
  }, [previewUrls]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category_id"
            value={product.category_id}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.category_name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Subcategory</label>
          <select
            name="subcategory_id"
            value={product.subcategory_id}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            disabled={!product.category_id}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.subcategory_name}</option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name *</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Style Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Style Code *</label>
          <input
            type="text"
            name="styleCode"
            value={product.styleCode}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">MRP *</label>
            <input
              type="number"
              name="MRP"
              value={product.MRP}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Price</label>
            <input
              type="number"
              value={calculateCurrentPrice(product.MRP, product.discount)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Color *</label>
            <input
              type="text"
              name="color"
              value={product.color}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fabric</label>
            <input
              type="text"
              name="Fabric"
              value={product.Fabric}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pattern</label>
            <input
              type="text"
              name="Pattern"
              value={product.Pattern}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              name="type"
              value={product.type}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Length Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Length Type</label>
            <input
              type="text"
              name="lengthType"
              value={product.lengthType}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Ideal For */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ideal For</label>
            <input
              type="text"
              name="idealFor"
              value={product.idealFor}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Style</label>
            <input
              type="text"
              name="style"
              value={product.style}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Neck */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Neck</label>
            <input
              type="text"
              name="neck"
              value={product.neck}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Sleeve */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sleeve</label>
            <input
              type="text"
              name="sleeve"
              value={product.sleeve}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Fabric Care */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fabric Care</label>
            <input
              type="text"
              name="FabricCare"
              value={product.FabricCare}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            name="tags"
            placeholder="Enter tags (comma-separated)"
            value={product.tags}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          <div className="mt-2 grid grid-cols-4 gap-2">
            {previewUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes and Stock</label>
          {product.sizes.map((size, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <select
                value={size.size}
                onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
                <option>XL</option>
              </select>
              <input
                type="number"
                value={size.stock}
                onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
                placeholder="Stock"
                className="p-2 border border-gray-300 rounded-md"
                min="0"
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSize}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            + Add Size
          </button>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={product.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Active</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          {"Add"} Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;