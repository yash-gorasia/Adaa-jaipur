import React from 'react';
import { FiX } from 'react-icons/fi';

const OrderDetailsModal = ({ order, items, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-black">Order Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-black transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{new Date(order.ordertime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-lg">₹{order.total_amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  order.order_status === 'Delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : order.order_status === 'Cancelled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {items?.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <img
                    src={item.product_id?.image[0]?.replace("'\'", "/")}
                    alt={item.product_id?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product_id?.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-2">
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                      <p>Price: ₹{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Order Button (only for pending orders) */}
          {order.order_status === 'Pending' && (
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;