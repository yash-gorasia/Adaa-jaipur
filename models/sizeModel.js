import mongoose, { Schema } from 'mongoose';

const sizeSchema = new Schema({
    sizeName: { type: String, required: true }, // e.g., "S", "M", "L", "XL"
    stock: { type: Number, required: true, default: 0 }, // Available quantity for this size
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true } // Reference to the product
}, {
    timestamps: true
});

const Size = mongoose.model("Size", sizeSchema);
export default Size;