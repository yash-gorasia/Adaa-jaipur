import express from 'express';
import {
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
} from '../controllers/productController.js';

const router = express.Router();

// Product routes
router.post('/addProduct', addProduct); // Add a new product
router.put('/updateProductDetails/:id', updateProductDetails); // Update product details
router.delete('/removeProduct/:id', removeProduct); // Remove a product
router.get('/fetchProducts', fetchProducts); // Fetch products with pagination and search
router.get('/fetchAllProducts', fetchAllProducts); // Fetch all products
router.get('/fetchProductById/:id', fetchProductById); // Fetch a single product by ID
router.get('/fetchProductsByCategory/:category_id', fetchProductsByCategory); // Fetch products by category
router.get('/fetchProductsBySubcategory/:subcategory_id', fetchProductsBySubcategory); // Fetch products by subcategory
router.get('/fetchProductByColor',fetchProductsByColor);
router.put('/updateProductStock', updateProductStock);

export default router;