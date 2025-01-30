import mongoose, { Schema } from "mongoose";

const subcategorySchema = new Schema({
    subcategory_name: { type: String, required: true },
    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
}, {
    timestamps: true
});

const subCategory = mongoose.model("Subcategory", subcategorySchema);
export default subCategory;