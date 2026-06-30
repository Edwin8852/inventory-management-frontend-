import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, PackageOpen, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { dashboardService } from '../../services/dashboard.service';
import { orderService } from '../../services/order.service';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getCustomerDashboard();
        const data = res.data.data;
        setStats({
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalPaidAmount || 0,
          totalProducts: data.totalProducts || 0 // Recommending from total catalog
        });
        const orderRes = await orderService.getOrders().catch(() => ({ data: { data: [] } }));
        setRecentOrders((orderRes.data.data || []).slice(0, 3));
      } catch (err) {
        console.error("Failed to load customer dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2">Welcome Back!</h1>
          <p className="text-rose-100 text-lg mb-6">Explore new collections, track your orders, and enjoy shopping.</p>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[120px]">
              <p className="text-xs uppercase tracking-wider text-rose-100 font-bold mb-1">Total Spent</p>
              <p className="text-2xl font-black">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[120px]">
              <p className="text-xs uppercase tracking-wider text-rose-100 font-bold mb-1">Orders</p>
              <p className="text-2xl font-black">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <Heart className="absolute -right-10 -top-10 w-64 h-64 text-white/10 transform rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center"><PackageOpen className="mr-2 text-primary" /> Active & Recent Orders</h2>
            <Link to="/my-orders" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                <Link to="/shop" className="mt-4 inline-block bg-dark text-white px-6 py-2 rounded-full font-bold">Start Shopping</Link>
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Order #{order.orderNumber?.slice(-6) || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="font-black text-primary text-xl mb-1">{formatCurrency(order.totalAmount)}</p>
                    <div className="flex items-center">
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-gray-100 text-gray-600 mr-2">{order.status}</span>
                      {order.deliveryDate && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-medium">
                          🚚 Est: {new Date(order.deliveryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Star className="mr-2 text-yellow-400 fill-current" /> Recommended For You</h3>
            <p className="text-sm text-gray-500 mb-6">Based on our {stats.totalProducts}+ catalog items.</p>
            
            {/* Fake recommended skeleton since we don't have a real recommendation engine yet */}
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden group-hover:scale-105 transition-transform">
                    {/* Placeholder image box */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100"></div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">Featured Item {i}</p>
                    <p className="text-sm text-primary font-bold mt-1">₹49.99</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/shop" className="block w-full py-3 mt-6 text-center bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-colors">
              Browse Full Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
