import Product from '../models/productModel.js'; // Import Product model
import Subcategory from "../models/subCategoryModel.js";
import path from 'path';
import multer from 'multer';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for storing images in memory
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (filetypes.test(extname) && mimetypes.test(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Images only'), false);
    }
};

const upload = multer({ storage, fileFilter }).array('image', 20); // Allow up to 20 image uploads

// Function to upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error: ", error);
                        reject(error);
                    } else {
                        console.log("Uploaded Image URL: ", result.secure_url);
                        resolve(result.secure_url);
                    }
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    });

    return Promise.all(uploadPromises);
};

// Create Product controller with multiple image uploads
const addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Error: ", err);
            return res.status(400).json({ message: err.message });
        }

        const {
            name,
            styleCode,
            description,
            MRP,
            discount,
            CurrentPrice,
            category_id,
            subcategory_id,
            color,
            FabricCare,
            Pattern,
            type,
            Fabric,
            lengthType,
            idealFor,
            style,
            neck,
            sleeve,
            tags,
            is_active,
            sizes // Expecting sizes as a JSON string
        } = req.body;

        let sizeArray = [];
        if (sizes) {
            try {
                sizeArray = JSON.parse(sizes).map(size => ({
                    size: size.size,
                    stock: size.stock || 0
                }));
            } catch (error) {
                return res.status(400).json({ message: 'Invalid sizes format' });
            }
        }

        if (!name || !styleCode || !MRP || !category_id || !color) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                imageUrls = await uploadImagesToCloudinary(req.files);
            } catch (error) {
                console.error("Image Upload Error: ", error);
                return res.status(500).json({ message: 'Error uploading images to Cloudinary' });
            }
        }

        try {
            const product = new Product({
                name,
                styleCode,
                MRP,
                discount,
                CurrentPrice,
                category_id,
                subcategory_id,
                color,
                FabricCare,
                Pattern,
                type,
                Fabric,
                lengthType,
                idealFor,
                style,
                neck,
                sleeve,
                tags,
                description,
                is_active: is_active !== undefined ? is_active : true,
                image: imageUrls, // Now this contains properly awaited URLs
                sizes: sizeArray
            });

            const newProduct = await product.save();
            res.status(201).json(newProduct);
        } catch (error) {
            console.error("Database Save Error: ", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

// Update product details
const updateProductDetails = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ message: err.message });
            }

            const {
                name,
                description,
                styleCode,
                MRP,
                discount,
                CurrentPrice,
                category_id,
                subcategory_id,
                color,
                tags,
                is_active,
                sizes // Expecting sizes as a JSON string
            } = req.body;

            const updatedFields = {};

            if (name) updatedFields.name = name;
            if (description) updatedFields.description = description;
            if (styleCode) updatedFields.styleCode = styleCode;
            if (MRP) updatedFields.MRP = parseFloat(MRP.replace(/,/g, ''));
            if (discount) updatedFields.discount = parseFloat(discount.replace(/,/g, ''));
            if (CurrentPrice) updatedFields.CurrentPrice = parseFloat(CurrentPrice.replace(/,/g, ''));
            if (category_id) updatedFields.category_id = category_id;
            if (subcategory_id) updatedFields.subcategory_id = subcategory_id;
            if (color) updatedFields.color = color;
            if (tags) updatedFields.tags = tags;
            if (typeof is_active !== 'undefined') updatedFields.is_active = is_active;

            if (sizes) {
                const sizeArray = JSON.parse(sizes).map(size => ({
                    size: size.size,
                    stock: size.stock || 0
                }));
                updatedFields.sizes = sizeArray;
            }

            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                try {
                    imageUrls = await uploadImagesToCloudinary(req.files);
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Error uploading images to Cloudinary' });
                }
                updatedFields.image = imageUrls;
            }

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { $set: updatedFields },
                { new: true }
            );

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({ message: "Product updated successfully", product });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Remove a product
const removeProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        // Delete associated sizes
        await Size.deleteMany({ product_id: req.params.id });

        res.status(201).json({ message: "Product removed successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetch products with search
const fetchProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword, $options: "i" } },
                    { description: { $regex: req.query.keyword, $options: "i" } },
                    { category: { $regex: req.query.keyword, $options: "i" } },
                    { subcategory: { $regex: req.query.keyword, $options: "i" } },
                    { tags: { $regex: req.query.keyword, $options: "i" } },
                ],
            }
            : {};

        const products = await Product.find({ ...keyword });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Fetch a single product by ID with sizes
const fetchProductById = async (req, res) => {
    try {
        const productId = req.params.id.trim(); // Remove leading/trailing spaces and newlines

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all products with sizes
const fetchAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate("category_id");
        const productsWithSizes = await Promise.all(products.map(async (product) => {
            const sizes = await Size.find({ product_id: product._id });
            return { ...product.toObject(), sizes };
        }));

        res.json(productsWithSizes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Fetch all products by category with sizes
const fetchProductsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        // Validate if the category exists
        const category = await Category.findById(category_id);
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }

        // Fetch products by category_id
        const products = await Product.find({ category_id }).populate("category_id");

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Fetch all products by subcategory with sizes
const fetchProductsBySubcategory = async (req, res) => {
    try {
        const { subcategory_id } = req.params;

        // Validate if the subcategory exists
        const subcategory = await Subcategory.findById(subcategory_id);
        if (!subcategory) {
            res.status(404);
            throw new Error("Subcategory not found");
        }

        // Fetch products by subcategory_id
        const products = await Product.find({ subcategory_id }).populate("subcategory_id");

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Fetch products by color
const fetchProductsByColor = async (req, res) => {
    try {
        const { color } = req.query; // Expecting color as a query parameter

        if (!color) {
            return res.status(400).json({ message: 'Color is required' });
        }

        const products = await Product.find({ color: { $regex: color, $options: "i" } });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found for the given color" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateProductStock = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const sizeIndex = product.sizes.findIndex(s => s.size === size);
        if (sizeIndex === -1) {
            return res.status(404).json({ message: 'Size not found' });
        }

        if (product.sizes[sizeIndex].stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        product.sizes[sizeIndex].stock -= quantity;
        await product.save();

        res.status(200).json({ message: 'Stock updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
    addProduct,
    updateProductDetails,
    removeProduct,
    fetchProducts,
    fetchProductById,
    fetchAllProducts,
    fetchProductsByCategory,
    fetchProductsBySubcategory,
    fetchProductsByColor,
    updateProductStock
};