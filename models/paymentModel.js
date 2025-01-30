import mongoose,{Schema} from 'mongoose';

const paymentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  payment_method: { type: String },
  payment_status: { type: String },
  transaction_id: { type: String },
  date: { type: Date, default: Date.now },
  currency: { type: String },
  payment_gateway_response: { type: String }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;