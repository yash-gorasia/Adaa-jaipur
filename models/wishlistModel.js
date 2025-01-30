import mongoose,{Schema} from 'mongoose';

const wishlistSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
},{
    timestamps: true
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;