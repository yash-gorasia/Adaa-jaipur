import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    size: { type: String },
    added_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true }
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;