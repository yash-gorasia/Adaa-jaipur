import Review from '../models/reviewModel.js';
import OrderItem from '../models/orderItemModel.js';
import Order from '../models/orderModel.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for storing images in memory
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (filetypes.test(extname) && mimetypes.test(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Images only'), false);
    }
};

const upload = multer({ storage, fileFilter }).array('photos', 5); // Allow up to 5 image uploads

// Function to upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'reviews' },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error: ", error);
                        reject(error);
                    } else {
                        console.log("Uploaded Image URL: ", result.secure_url);
                        resolve(result.secure_url);
                    }
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    });

    return Promise.all(uploadPromises);
};

// Add a review
const addReview = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Error: ", err);
            return res.status(400).json({ message: err.message });
        }

        const { user_id, product_id, rating, reviewText } = req.body;

        if (!user_id || !product_id || !rating || !reviewText) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check if the user has purchased the product
        const orderItem = await OrderItem.findOne({ product_id, order_id: { $in: await Order.find({ user_id }).distinct('_id') } });
        const verifiedPurchase = !!orderItem;

        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                photoUrls = await uploadImagesToCloudinary(req.files);
            } catch (error) {
                console.error("Image Upload Error: ", error);
                return res.status(500).json({ message: 'Error uploading images to Cloudinary' });
            }
        }

        try {
            const review = new Review({
                user_id,
                product_id,
                rating,
                reviewText,
                photos: photoUrls,
                verifiedPurchase,
            });

            const newReview = await review.save();
            res.status(201).json(newReview);
        } catch (error) {
            console.error("Database Save Error: ", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
// Fetch reviews for a product
const fetchReviewsForProduct = async (req, res) => {
    try {
        const { product_id } = req.params;

        const reviews = await Review.find({ product_id }).populate('user_id', 'name email');
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { rating, reviewText } = req.body;

        const review = await Review.findByIdAndUpdate(
            review_id,
            { rating, reviewText },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { review_id } = req.params;

        const review = await Review.findByIdAndDelete(review_id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { addReview, fetchReviewsForProduct, updateReview, deleteReview };