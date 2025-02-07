import React, { useState, useEffect } from 'react';
import { 
  FiTruck, FiCheckCircle, FiXCircle, FiClock, FiPackage, 
  FiSearch, FiCalendar, FiMapPin, FiCreditCard
} from 'react-icons/fi';

const ORDER_STATUSES = [
  'Pending',  
  'Shipped', 
  'Out for Delivery',
  'Delivered', 
  'Cancelled'
];

const AdminOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders/fetchAllOrders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const ordersData = await response.json();
        setOrders(ordersData);

        const items = {};
        for (const order of ordersData) {
          const itemsResponse = await fetch(`/api/orderItems/fetchOrderItemsByOrderId/${order._id}`);
          if (itemsResponse.ok) {
            items[order._id] = await itemsResponse.json();
          }
        }
        setOrderItems(items);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/updateOrder/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus })
      });

      if (response.ok) {
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, order_status: newStatus } 
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleUpdateEstimatedDate = async (orderId, newDate) => {
    try {
      const response = await fetch(`/api/orders/updateOrder/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estimatedDeliveryDate: new Date(newDate).toISOString() 
        })
      });

      if (response.ok) {
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, estimatedDeliveryDate: new Date(newDate) } 
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating estimated delivery date:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    
    const hasMatchingItem = orderItems[order._id]?.some(item => 
      item.product_id.name.toLowerCase().includes(searchLower) ||
      item.product_id.styleCode.toLowerCase().includes(searchLower)
    );

    const matchesDate = filterDate 
      ? new Date(order.ordertime).toISOString().split('T')[0] === filterDate 
      : true;

    const matchesStatus = filterStatus 
      ? order.order_status === filterStatus 
      : true;

    return (
      (hasMatchingItem ||
      order._id.toLowerCase().includes(searchLower) ||
      order.total_amount.toString().includes(searchLower)) 
      && matchesDate 
      && matchesStatus
    );
  });

  const renderPaymentMode = (order) => {
    if (order.paymentmode === 'Card') {
      return `Card (${order.paymentDetails.card.lastFourDigits})`;
    }
    if (order.paymentmode === 'UPI') {
      return `UPI (${order.paymentDetails.upi.upiId})`;
    }
    return order.paymentmode;
  };

  return (
    <div className="min-h-screen mt-8 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        {/* Search and Filter Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name, style code, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">No orders found</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-medium">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p>{new Date(order.ordertime).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Delivery</p>
                    <input
                      type="date"
                      value={
                        order.estimatedDeliveryDate 
                          ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] 
                          : ''
                      }
                      onChange={(e) => handleUpdateEstimatedDate(order._id, e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Mode</p>
                    <p>{renderPaymentMode(order)}</p>
                  </div>
                </div>

                {/* Order Status */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Order Status</p>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6 border-t pt-4">
                  <p className="text-gray-600 mb-2">Delivery Address</p>
                  <div className="flex items-start space-x-2">
                    <FiMapPin className="text-gray-600 mt-1" />
                    <p>{order.delivery_address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orderItems[order._id]?.map((item) => {
                      const product = item.product_id;
                      return (
                        <div key={item._id} className="border rounded-lg p-4">
                          <div className="flex space-x-4 mb-4">
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">Style Code: {product.styleCode}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-600">Size</p>
                              <p>{item.size}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Quantity</p>
                              <p>{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Price</p>
                              <p>₹{item.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Color</p>
                              <p>{product.color}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagementPage;