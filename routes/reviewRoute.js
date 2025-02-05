import express from 'express';
import { addReview, fetchReviewsForProduct, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// Review routes
router.post('/addReview', addReview); // Add a review
router.get('/fetchReviewsForProduct/:product_id', fetchReviewsForProduct); // Fetch reviews for a product
router.put('/updateReview/:review_id', updateReview); // Update a review
router.delete('/deleteReview/:review_id', deleteReview); // Delete a review

export default router;