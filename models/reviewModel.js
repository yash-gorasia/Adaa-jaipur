import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  photos: [{ type: String }], // Array of image URLs
  verifiedPurchase: { type: Boolean, default: false }, // Verified purchase flag
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;