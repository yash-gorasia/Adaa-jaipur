import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/fetchProductById/${id}`);
        const data = await res.json();
        setProduct(data.product);
        setFormData(data.product);
        setExistingImages(data.product.image || []);
        setPreviewImages(data.product.image || []);
        setSelectedCategory(data.product.category_id);
        setSelectedSubcategory(data.product.subcategory_id);
        console.log("Fetched product:", data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/getAllCategories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const res = await fetch('/api/subcategories/getAllSubcategories');
        const data = await res.json();
        setSubcategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchProduct();
    fetchCategories();
    fetchSubcategories();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    setFormData({ ...formData, categoryId, subcategory_id: null });
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    setFormData({ ...formData, subcategory_id: subcategoryId });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previewURLs = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...existingImages, ...previewURLs]);
  };
  const handleSizeStockChange = (e, index) => {
    const newSizes = [...formData.sizes];
    newSizes[index].stock = parseInt(e.target.value, 10);
    setFormData({ ...formData, sizes: newSizes });
  };
  const handleRemoveImage = (index) => {
    const updatedPreviewImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviewImages);
    if (index >= existingImages.length) {
      const updatedNewImages = newImages.filter((_, i) => i !== (index - existingImages.length));
      setNewImages(updatedNewImages);
    } else {
      const updatedExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedExistingImages);
    }
  };

  const handleSave = async () => {
    try {
      const updatedFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "image") {
          if (key === "sizes" && Array.isArray(formData[key])) {
            updatedFormData.append(key, JSON.stringify(formData[key]));
          } else {
            updatedFormData.append(key, formData[key]);
          }
        }
      });

      newImages.forEach((image) => {
        updatedFormData.append("image", image);
      });

      existingImages.forEach((image) => {
        updatedFormData.append("existingImages", image);
      });

      const res = await fetch(`/api/products/updateProductDetails/${id}`, {
        method: "PUT",
        body: updatedFormData,
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        setProduct(updatedProduct.product);
        setFormData(updatedProduct.product);
        setIsEditing(false);
        setNewImages([]);
        setExistingImages(updatedProduct.product.image || []);
        setPreviewImages(updatedProduct.product.image || []);
        setSelectedCategory(updatedProduct.product.category_id);
        setSelectedSubcategory(updatedProduct.product.subcategory_id);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const renderCategories = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        {isEditing ? (
          <select
            name="categoryId"
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.category_name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-lg text-gray-900">
            {categories.find(cat => cat._id === selectedCategory)?.category_name || "No category selected"}
          </p>
        )}
      </div>
    );
  };

  const renderSubcategories = () => {
    const filteredSubcategories = subcategories.filter(sub => {
      if (!sub.category_id) return false;
      console.log("sub", sub.category_id._id);
      return sub.category_id._id === selectedCategory;
    });
    console.log("filteredSubcategories", filteredSubcategories);
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
        {isEditing ? (
          <select
            name="subcategory_id"
            value={selectedSubcategory || ""}
            onChange={handleSubcategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select Subcategory</option>
            {console.log("filterede", filteredSubcategories)}
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.subcategory_name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-lg text-gray-900">
            {subcategories.find(sub => sub._id === selectedSubcategory)?.subcategory_name || "No subcategory selected"}
          </p>
        )}
      </div>
    );
  };

  if (!product) return <div className="p-6">Loading...</div>;

  const renderField = (label, value, name) => {
    return isEditing ? (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="text"
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
    ) : (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <p className="text-lg text-gray-900">{value}</p>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Product Details</h2>
          <div>
            {isEditing ? (
              <div className="flex space-x-4">
                <button onClick={handleSave} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {["basic", "details", "images", "categories", "stock"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === tab
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "categories" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCategories()}
                {renderSubcategories()}
              </div>
            )}
            {activeTab === "stock" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.sizes.map((size, index) => (
                    <div key={index} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {size.size} Stock
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name={`sizes[${index}].stock`}
                          value={formData.sizes[index].stock || 0}
                          onChange={(e) => handleSizeStockChange(e, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{size.stock}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Name", product.name, "name")}
                {renderField("Style Code", product.styleCode, "styleCode")}
                {renderField("Type", product.type, "type")}
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="4"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{product.description}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderField("Color", product.color, "color")}
                {renderField("Pattern", product.Pattern, "Pattern")}
                {renderField("Fabric", product.Fabric, "Fabric")}
                {renderField("Length Type", product.lengthType, "lengthType")}
                {renderField("Ideal For", product.idealFor, "idealFor")}
                {renderField("Style", product.style, "style")}
                {renderField("Neck", product.neck, "neck")}
                {renderField("Sleeve", product.sleeve, "sleeve")}
                {renderField("Fabric Care", product.FabricCare, "FabricCare")}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Details</label>
                  <div className="space-y-2">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="MRP"
                          value={formData.MRP || ""}
                          onChange={handleInputChange}
                          placeholder="MRP"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount || ""}
                          onChange={handleInputChange}
                          placeholder="Discount %"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-lg text-gray-900">MRP: ₹{product.MRP}</p>
                        <p className="text-lg text-gray-900">Discount: {product.discount}%</p>
                        <p className="text-lg text-gray-900">Final Price: ₹{product.CurrentPrice}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
                    <input
                      type="file"
                      name="images"
                      multiple
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;