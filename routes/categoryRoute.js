import express from 'express';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    readCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Category routes
router.post('/createCategory', createCategory); // Add a new category
router.put('/updateCategory/:categoryId', updateCategory); // Update category details
router.delete('/deleteCategory/:categoryId', deleteCategory); // Delete a category
router.get('/getAllCategories', getAllCategories); // Fetch all categories
 router.get('/readCategory/:id', readCategory); // Fetch a single category by ID

export default router;