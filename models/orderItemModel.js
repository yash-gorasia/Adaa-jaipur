import mongoose,{Schema} from 'mongoose';

const orderItemSchema = new Schema({
    order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String }
},{
    timestamps: true
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);
export default OrderItem;