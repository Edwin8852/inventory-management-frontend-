import React, { useState, useEffect } from 'react';
import { Package, Search, Loader2, Truck, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { orderService } from '../../services/order.service';
import OrderDetailsModal from './OrderDetailsModal';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import { purchaseService } from '../../services/purchase.service';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { user } = useAuth();
  const isSupplier = user?.role === 'SUPPLIER';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = isSupplier 
        ? await purchaseService.getPurchases() 
        : await orderService.getOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const openOrderView = async (order) => {
    try {
      const res = isSupplier 
        ? await purchaseService.getPurchaseById(order.id)
        : await orderService.getOrderById(order.id);
      setSelectedOrder(res.data.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch order details');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Order Placed': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'Confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'Packed': return <Package className="w-5 h-5 text-yellow-500" />;
      case 'Shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'Out For Delivery': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-success" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-success text-white';
      case 'Shipped': case 'Out For Delivery': return 'bg-indigo-500 text-white';
      case 'Confirmed': return 'bg-blue-500 text-white';
      case 'Packed': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getDeliveryDateText = (order) => {
    if (order.status === 'Delivered') {
      return `Delivered on ${new Date(order.updatedAt).toLocaleDateString()}`;
    }
    if (order.deliveryDate) {
      return `Estimated Delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`;
    }
    return 'Delivery Date TBD';
  };

  const filteredOrders = orders.filter(o => {
    const orderNum = isSupplier ? o.poNumber : o.orderNumber;
    return orderNum?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">My Orders</h1>
          <p className="text-gray-500 mt-1 text-lg">Track, manage, and view your order history.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 mb-4 flex justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Order ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">You haven't placed any orders yet, or no orders match your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => openOrderView(order)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg text-gray-800">{isSupplier ? order.poNumber : order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-primary font-medium text-sm flex items-center">
                    <Truck className="w-4 h-4 mr-1" /> {getDeliveryDateText(order)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-gray-800">{formatCurrency(order.totalAmount)}</p>
                  <button className="mt-3 text-primary font-bold hover:underline text-sm">View Details &rarr;</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OrderDetailsModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        order={selectedOrder} 
        isSupplier={isSupplier} 
      />
    </div>
  );
};

export default MyOrders;
