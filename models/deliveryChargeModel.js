import e from "express";
import mongoose,{Schema} from "mongoose";

const deliveryChargeSchema = new Schema({
  location: { type: String, required: true },
  charge_amount: { type: Number, required: true },
  minimum_order_amount: { type: Number },
}, {
    timestamps: true
});

const DeliveryCharge = mongoose.model("DeliveryCharge", deliveryChargeSchema);
export default DeliveryCharge;