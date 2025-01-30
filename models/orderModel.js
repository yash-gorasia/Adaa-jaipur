import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    total_amount: { type: Number, required: true },
    paymentmode: { type: String, required: true }, // Card, UPI, or COD
    paymentDetails: { 
        card: {
            cardNumber: { type: String },
            expiryDate: { type: String },
            cvv: { type: String },
            lastFourDigits: { type: String },
        },
        upi: {
            upiId: { type: String },
        }
    },
    order_status: { type: String, default: 'Pending' },
    ordertime: { type: Date, default: Date.now },
    estimatedDeliveryDate: { type: Date }, // New field for estimated delivery
    delivery_address: { type: String, required: true },
    tracking_number: { type: String, unique: true },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;