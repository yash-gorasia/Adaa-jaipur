import Subcategory from '../models/subCategoryModel.js'; // Import Subcategory model for CRUD operations
import Category from '../models/categoryModel.js'; // Import Category model for validation


// Create a new subcategory
const createSubcategory = async (req, res) => {
    try {
        const { subcategory_name, category_id } = req.body;
        // Validate input
        if (!subcategory_name || !category_id) {
            return res.status(400).json({ message: 'Subcategory name and category ID are required' });
        }

        // Check if the parent category exists
        const category = await Category.findById(category_id);
        if (!category) {
            return res.status(404).json({ message: 'Parent category not found' });
        }

        // Check if the subcategory already exists under the same category
        const existingSubcategory = await Subcategory.findOne({ subcategory_name, category_id });
        if (existingSubcategory) {
            return res.status(400).json({ message: 'Subcategory already exists under this category' });
        }

        // Create the subcategory
        const subcategory = await new Subcategory({ subcategory_name, category_id }).save();
        res.status(201).json(subcategory); // 201 for resource creation

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update a subcategory
const updateSubcategory = async (req, res) => {
    try {
        const { subcategory_name } = req.body;
        const { subcategoryId } = req.params;

        // Find the subcategory
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Update the subcategory name
        subcategory.subcategory_name = subcategory_name;

        // Save the updated subcategory
        const updatedSubcategory = await subcategory.save();
        res.json(updatedSubcategory);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a subcategory
const deleteSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        // Find the subcategory
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Check if the subcategory has associated products
        const products = await Product.find({ subcategory_id: subcategoryId }); // Assuming you have a Product model
        if (products.length > 0) {
            return res.status(400).json({ message: 'Cannot delete subcategory with associated products' });
        }

        // Delete the subcategory
        await subcategory.deleteOne();
        res.json({ message: 'Subcategory deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get all subcategories
const getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find({}).populate('category_id', 'category_name'); // Populate parent category details
        res.json(subcategories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get subcategories by category ID
const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find subcategories under the specified category
        const subcategories = await Subcategory.find({ category_id: categoryId });
        res.json(subcategories);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get a single subcategory by ID
const readSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the subcategory
        const subcategory = await Subcategory.findById(id).populate('category_id', 'category_name'); // Populate parent category details
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.json(subcategory);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getAllSubcategories,
    getSubcategoriesByCategory,
    readSubcategory
};