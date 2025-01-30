// controllers/cartController.js
import Cart from '../models/cartModel.js';

// Add a product to the cart
const addToCart = async (req, res) => {
    try {
        const { user_id, product_id, quantity, size } = req.body;

        // Check if the product already exists in the cart for the user
        const existingCartItem = await Cart.findOne({ user_id, product_id, size });

        if (existingCartItem) {
            // If the item already exists, update the quantity
            existingCartItem.quantity += quantity;
            const updatedCartItem = await existingCartItem.save();
            return res.status(200).json(updatedCartItem);
        }

        // If the item doesn't exist, create a new cart item
        const newCartItem = new Cart({
            user_id,
            product_id,
            quantity,
            size, // Include the size
        });

        const savedCartItem = await newCartItem.save();
        res.status(201).json(savedCartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch all cart items for a specific user
const fetchCartItemsByUserId = async (req, res) => {
    try {
        const cartItems = await Cart.find({ user_id: req.params.user_id })
            .populate('product_id') // Populate product details
            .select('-__v'); // Exclude unnecessary fields

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a cart item
const updateCartItem = async (req, res) => {
    try {
        const { quantity, size } = req.body;

        const updatedCartItem = await Cart.findByIdAndUpdate(
            req.params.id,
            { quantity, size }, // Update both quantity and size
            { new: true }
        );

        if (!updatedCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json(updatedCartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a cart item
const deleteCartItem = async (req, res) => {
    try {
        const deletedCartItem = await Cart.findByIdAndDelete(req.params.id);
        if (!deletedCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear the cart for a specific user
const clearCart = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Delete all cart items for the user
        const result = await Cart.deleteMany({ user_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No cart items found for this user' });
        }

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    addToCart,
    fetchCartItemsByUserId,
    updateCartItem,
    deleteCartItem,
    clearCart, // Export the new clearCart function
};