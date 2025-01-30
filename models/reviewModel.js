import mongoose,{Schema} from 'mongoose';

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  rating: { type: Number, required: true },
  comment: { type: String },
  postdate: { type: Date, default: Date.now },
  photo: { type: String },
  verified_purchase: { type: Boolean, default: false }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;