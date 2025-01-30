import Wishlist from '../models/wishlistModel.js';

// Add a product to the wishlist
const addToWishlist = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        // Check if the product is already in the wishlist
        const existingWishlistItem = await Wishlist.findOne({ user_id, product_id });
        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        // Create a new wishlist item
        const newWishlistItem = new Wishlist({
            user_id,
            product_id
        });

        // Save the wishlist item to the database
        await newWishlistItem.save();

        res.status(201).json({ message: 'Product added to wishlist successfully', wishlistItem: newWishlistItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

// Remove a product from the wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        // Find and delete the wishlist item
        const deletedWishlistItem = await Wishlist.findOneAndDelete({ user_id, product_id });
        if (!deletedWishlistItem) {
            return res.status(404).json({ message: 'Product not found in wishlist' });
        }

        res.status(200).json({ message: 'Product removed from wishlist successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

// Get all wishlist items for a user
const getWishlist = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Find all wishlist items for the user
        const wishlistItems = await Wishlist.find({ user_id }).populate('product_id');

        res.status(200).json({ wishlistItems });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

export { addToWishlist, removeFromWishlist, getWishlist };