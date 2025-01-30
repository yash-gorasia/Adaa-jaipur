// controllers/orderItemController.js
import OrderItem from '../models/orderItemModel.js';

// Add an item to an order
const addOrderItem = async (req, res) => {
    try {
        const { order_id, product_id, quantity, price, size } = req.body;

        const newOrderItem = new OrderItem({
            order_id,
            product_id,
            quantity,
            price,
            size
        });

        const savedOrderItem = await newOrderItem.save();
        res.status(201).json(savedOrderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch all order items for a specific order
const fetchOrderItemsByOrderId = async (req, res) => {
    try {
        const orderItems = await OrderItem.find({ order_id: req.params.order_id }).populate('product_id');
        res.status(200).json(orderItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order item
const updateOrderItem = async (req, res) => {
    try {
        const { quantity, price, size } = req.body;

        const updatedOrderItem = await OrderItem.findByIdAndUpdate(
            req.params.id,
            { quantity, price, size },
            { new: true }
        );

        if (!updatedOrderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an order item
const deleteOrderItem = async (req, res) => {
    try {
        const deletedOrderItem = await OrderItem.findByIdAndDelete(req.params.id);
        if (!deletedOrderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    addOrderItem,
    fetchOrderItemsByOrderId,
    updateOrderItem,
    deleteOrderItem
};