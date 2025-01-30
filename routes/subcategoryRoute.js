import express from 'express';
import {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getAllSubcategories,
    getSubcategoriesByCategory,
    readSubcategory
} from '../controllers/subCategoryController.js';

const router = express.Router();

// Subcategory routes
router.post('/createSubcategory', createSubcategory); // Add a new subcategory
router.put('/updateSubcategory/:id', updateSubcategory); // Update subcategory details
router.delete('/deleteSubcategory/:id', deleteSubcategory); // Delete a subcategory
router.get('/getAllSubcategories', getAllSubcategories); // Fetch all subcategories
router.get('/getSubcategoriesByCategory/:categoryId', getSubcategoriesByCategory); // Fetch subcategories by category ID
router.get('/readSubcategory/:id', readSubcategory); // Fetch a single subcategory by ID

export default router;