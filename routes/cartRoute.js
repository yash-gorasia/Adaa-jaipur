// routes/cartRoutes.js
import express from 'express';
import {
    addToCart,
    fetchCartItemsByUserId,
    updateCartItem,
    deleteCartItem,
    clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// Cart routes
router.post('/addToCart', addToCart); // Add a product to the cart
router.get('/fetchCartItemsByUserId/:user_id', fetchCartItemsByUserId); // Fetch all cart items for a specific user
router.put('/updateCartItem/:id', updateCartItem); // Update a cart item
router.delete('/deleteCartItem/:id', deleteCartItem); // Delete a cart item
router.delete('/clearCart/:user_id', clearCart); // Clear the cart for a user

export default router;