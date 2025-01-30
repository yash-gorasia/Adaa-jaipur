import Order from '../models/orderModel.js';
import User from '../models/userModel.js'; // Import User model
import sendEmail from '../utils/emailSender.js'; // Import email utility
import gateway from '../config/braintreeConfig.js'; // Import Braintree gateway
// Create a new order
const createOrder = async (req, res) => {
    try {
        const {
            user_id,
            total_amount,
            payment_method_nonce,
            delivery_address,
            paymentmode,
            paymentDetails
        } = req.body;

        // Validate required fields
        if (!user_id || !total_amount || !payment_method_nonce || !delivery_address) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: 'All fields are required: user_id, total_amount, payment_method_nonce, delivery_address'
            });
        }

        // Process payment with Braintree
        const result = await gateway.transaction.sale({
            amount: total_amount.toString(), // Ensure amount is string
            paymentMethodNonce: payment_method_nonce,
            options: {
                submitForSettlement: true
            }
        });
        if (!result.success===true) {
            return res.status(400).json({ 
                message: 'Payment failed', 
                details: result.message || result.transaction?.processorResponseText || 'Transaction failed'
            });
        }

        // Calculate estimated delivery (7 days from now)
        const estimatedDeliveryDate = new Date();
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

        // Generate unique tracking number
        const tracking_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newOrder = new Order({
            user_id,
            total_amount,
            paymentmode,
            delivery_address,
            paymentDetails,
            estimatedDeliveryDate,
            tracking_number,
            order_status: 'Pending',
            transaction_id: result.transaction.id // Save Braintree transaction ID
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Server error while processing order',
            details: error.message 
        });
    }
};
// Get all orders
const fetchAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user_id');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single order by ID
const fetchOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order
const updateOrder = async (req, res) => {
    try {
        const { order_status, delivery_address, tracking_number, estimatedDeliveryDate } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { order_status, delivery_address, tracking_number, estimatedDeliveryDate },
            { new: true }
        ).populate('user_id'); // Populate user details to get email

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order status is updated to "Out for Delivery"
        if (order_status === 'Out for Delivery') {
            const user = await User.findById(updatedOrder.user_id); // Fetch user details
            if (user) {
                const emailText = `Hi ${user.name},\n\nGreat news! 🎉 Your order (ID: ${updatedOrder._id}) is out for delivery and will be arriving today. Get ready to receive your package!\n\nWe hope you love your purchase. If you have any questions or need assistance, feel free to reach out to us.\n\nThank you for shopping with us!\n\nBest regards,\nAdaa Jaipur.`;// Send email to the user
                await sendEmail(user.email, 'Order Out for Delivery', emailText);
            }
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders by user ID
const fetchOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.params.user_id }).populate('user_id');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    createOrder,
    fetchAllOrders,
    fetchOrderById,
    updateOrder,
    deleteOrder,
    fetchOrdersByUserId
};