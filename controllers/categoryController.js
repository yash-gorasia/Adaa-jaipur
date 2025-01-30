import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Category from '../models/categoryModel.js'; 

// Use memory storage for multer to store the file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image"); // 'image' is the field name in the form

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'deb7t07bm', 
    api_key: '513993627366646',       
    api_secret: '0DDlhdRCFbwrn47jA3wHDb4dwak', 
});

// Function to upload the image to Cloudinary
const uploadToCloudinary = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: fileName, folder: 'categories' }, // Optional folder structure
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url); // Return the secure URL of the uploaded image
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// Controller to create a category with an image
const createCategory = async (req, res) => {
    console.log("Received request body:", req.body); // Check request body

    upload(req, res, async (err) => {
        if (err) {
            console.log('Multer error:', err);
            return res.status(400).json({ message: err.message });
        }

        console.log("File uploaded successfully:", req.file); // Check if file is uploaded

        const { category_name } = req.body;
        console.log("Category name:", category_name); // Log the category name

        if (!category_name) {
            console.log('Category name is missing');
            return res.status(400).json({ message: 'Category name is required' });
        }

        if (!req.file) {
            console.log('No file found in request');
            return res.status(400).json({ message: 'Image is required' });
        }

        const { buffer, originalname } = req.file; // Get file details

        try {
            // Upload the image to Cloudinary and get the URL
            const imageUrl = await uploadToCloudinary(buffer, originalname);
            console.log("Image uploaded to Cloudinary, URL:", imageUrl);

            // Check if the category already exists in the database
            const existingCategory = await Category.findOne({ category_name });
            if (existingCategory) {
                console.log("Category already exists in database:", existingCategory);
                return res.status(400).json({ message: 'Category already exists' });
            }

            // Save the category to the database with the Cloudinary image URL
            const category = new Category({
                category_name,
                imageurl: imageUrl,
            });
            await category.save();
            console.log("New category saved:", category);

            // Respond with the created category
            res.status(201).json(category);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Error uploading image to Cloudinary" });
        }
    });
};


// Update a category
const updateCategory = async (req, res) => {
    // Use multer to handle the image upload (in memory)
    upload(req, res, async (err) => {
        if (err) {
            console.log('Multer error:', err);
            return res.status(400).json({ message: err.message });
        }

        const { category_name } = req.body; // Updated category name from the request body
        const { categoryId } = req.params; // Category ID from the request params

        console.log("Updating category:", { category_name, categoryId });

        try {
            // Find the category by ID
            const category = await Category.findById(categoryId);

            if (!category) {
                console.log('Category not found');
                return res.status(404).json({ message: 'Category not found' });
            }

            // Update the category name if provided
            if (category_name) {
                category.category_name = category_name;
            }

            // If a new image is provided, upload it to Cloudinary
            if (req.file) {
                console.log("File uploaded for update:", req.file);

                const { buffer, originalname } = req.file; // Get the new file details

                // Upload the new image to Cloudinary
                const newImageUrl = await uploadToCloudinary(buffer, originalname);
                console.log("New image uploaded to Cloudinary, URL:", newImageUrl);

                // Update the category's image URL
                category.imageurl = newImageUrl;
            }

            // Save the updated category
            const updatedCategory = await category.save();
            console.log("Category updated:", updatedCategory);

            res.json(updatedCategory);
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if the category has associated subcategories
        const subcategories = await Subcategory.find({ category_id: categoryId });
        if (subcategories.length > 0) {
            return res.status(400).json({ message: 'Cannot delete category with associated subcategories' });
        }

        await category.deleteOne();
        res.json({ message: 'Category deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get a single category by ID
const readCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { createCategory, updateCategory, deleteCategory, getAllCategories, readCategory };