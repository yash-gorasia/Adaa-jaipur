// routes/orderRoutes.js
import express from 'express';
import {
    createOrder,
    fetchAllOrders,
    fetchOrderById,
    updateOrder,
    deleteOrder,
    fetchOrdersByUserId
} from '../controllers/orderController.js';

const router = express.Router();        

// Order routes
router.post('/createOrder', createOrder); // Create a new order
router.get('/fetchAllOrders', fetchAllOrders); // Fetch all orders
router.get('/fetchOrderById/:id', fetchOrderById); // Fetch a single order by ID
router.put('/updateOrder/:id', updateOrder); // Update an order
router.delete('/deleteOrder/:id', deleteOrder); // Delete an order
router.get('/fetchOrdersByUserId/:user_id', fetchOrdersByUserId);
export default router;