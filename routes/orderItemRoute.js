// routes/orderItemRoutes.js
import express from 'express';
import {
    addOrderItem,
    fetchOrderItemsByOrderId,
    updateOrderItem,
    deleteOrderItem
} from '../controllers/orderItemController.js';

const router = express.Router();

// OrderItem routes
router.post('/addOrderItem', addOrderItem); // Add an item to an order
router.get('/fetchOrderItemsByOrderId/:order_id', fetchOrderItemsByOrderId); // Fetch all items for a specific order
router.put('/updateOrderItem/:id', updateOrderItem); // Update an order item
router.delete('/deleteOrderItem/:id', deleteOrderItem); // Delete an order item

export default router;