import React, { useState, useEffect } from 'react';
import { FiTruck, FiCheckCircle, FiXCircle, FiClock, FiPackage, FiSearch, FiFilter } from 'react-icons/fi';
import Header from '../Components/Shared/Header';
import Footer from '../Components/Shared/Footer';

const OrderPage = () => {
    const userId = localStorage.getItem('userId');
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('date');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`/api/orders/fetchOrdersByUserId/${userId}`);
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
            }
        };
        fetchOrders();
    }, [userId]);

    const handleCancelOrder = async (orderId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/updateOrder/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_status: 'Cancelled' }),
            });

            if (!response.ok) throw new Error('Failed to cancel order');

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, order_status: 'Cancelled' } : order
                )
            );
        } catch (err) {
            console.error('Error canceling order:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <FiClock className="text-gray-600" />;
            case 'Shipped': return <FiTruck className="text-gray-800" />;
            case 'Delivered': return <FiCheckCircle className="text-gray-800" />;
            case 'Cancelled': return <FiXCircle className="text-gray-600" />;
            default: return <FiPackage className="text-gray-600" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'bg-gray-100';
            case 'Shipped': return 'bg-gray-200';
            case 'Delivered': return 'bg-gray-300';
            case 'Cancelled': return 'bg-gray-100';
            default: return 'bg-gray-100';
        }
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const hasMatchingProduct = orderItems[order._id]?.some(item =>
            item.product_id?.name.toLowerCase().includes(searchLower)
        );
        const matchesAmount = order.total_amount.toString().includes(searchLower);
        const matchesStatus = order.order_status.toLowerCase().includes(searchLower);

        return hasMatchingProduct || matchesAmount || matchesStatus;
    });

    const sortedOrders = filteredOrders.sort((a, b) => {
        switch (sortOption) {
            case 'date':
                return new Date(b.ordertime) - new Date(a.ordertime);
            case 'status':
                return a.order_status.localeCompare(b.order_status);
            case 'amount':
                return b.total_amount - a.total_amount;
            default:
                return 0;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Header transparent={false} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mt-[5%] md:mb-[0%] mb-[13%]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="mt-2 text-sm text-gray-600">Track and manage your orders</p>
                </div>

                <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by product, amount, or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FiFilter className="mr-2" />
                            Filter
                        </button>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                        >
                            <option value="date">Latest First</option>
                            <option value="status">By Status</option>
                            <option value="amount">By Amount</option>
                        </select>
                    </div>
                </div>

                {sortedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
                        <FiPackage size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No orders found</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(order.order_status)}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </div>
                                        <div className="mt-2 sm:mt-0 text-xl font-semibold">₹{order.total_amount.toLocaleString()}</div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Order Date</p>
                                                <p className="font-medium">{new Date(order.ordertime).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Estimated Delivery</p>
                                                <p className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-gray-600">Delivery Address</p>
                                                <p className="font-medium">{order.delivery_address}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6">
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                {orderItems[order._id]?.map((item) => (
                                                    <div key={item._id} className="flex space-x-4">
                                                        <img
                                                            src={item.product_id?.image[0]?.replace("'\'", "/")}
                                                            alt={item.product_id?.name}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.product_id?.name}</p>
                                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {order.order_status === 'Pending' && (
                                        <div className="mt-6 text-right">
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={isLoading}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default OrderPage;