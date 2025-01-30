import mongoose, { Schema } from "mongoose";

const placeSchema = new Schema({
    location_name: { type: String, required: true },
    is_available: { type: Boolean, default: true },
}, {
    timestamps: true
});

const Place = mongoose.model("Place", placeSchema);
export default Place;