import React, { useState, useEffect } from 'react';
import { ShoppingCart, Receipt, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { dashboardService } from '../../services/dashboard.service';
import { purchaseService } from '../../services/purchase.service';
import { Link } from 'react-router-dom';

const SupplierDashboard = () => {
  const [stats, setStats] = useState({ totalPOs: 0, totalInvoiced: 0, totalPaid: 0, pendingPayments: 0 });
  const [recentPOs, setRecentPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getSupplierDashboard();
        const data = res.data.data;
        setStats({
          totalPOs: data.totalPOs || 0,
          totalInvoiced: data.totalInvoiced || 0,
          totalPaid: data.totalPaidAmount || 0,
          pendingPayments: data.pendingPayments || 0
        });
        const poRes = await purchaseService.getPurchases().catch(() => ({ data: { data: [] } }));
        setRecentPOs((poRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load supplier dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Supplier Hub</h1>
        <p className="text-gray-500 mt-1">Manage your purchase orders and track payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4"><p className="font-medium text-indigo-100">Total Paid</p><TrendingUp className="text-indigo-200" /></div>
          <h3 className="text-3xl font-black">{formatCurrency(stats.totalPaid)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4"><p className="text-sm font-medium text-gray-500">Pending Payments</p><Receipt className="text-orange-400" /></div>
          <h3 className="text-2xl font-black text-gray-800">{formatCurrency(stats.pendingPayments)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4"><p className="text-sm font-medium text-gray-500">Total POs</p><ShoppingCart className="text-blue-500" /></div>
          <h3 className="text-2xl font-black text-gray-800">{stats.totalPOs}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4"><p className="text-sm font-medium text-gray-500">Total Invoiced</p><Package className="text-green-500" /></div>
          <h3 className="text-2xl font-black text-gray-800">{formatCurrency(stats.totalInvoiced)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Recent Purchase Orders</h3>
          <div className="space-y-4">
            {recentPOs.length === 0 ? <p className="text-gray-400 text-sm">No recent POs found.</p> : recentPOs.map(po => (
              <div key={po.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-800">{po.poNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(po.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(po.totalAmount)}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${po.status === 'Delivered' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-600'}`}>{po.status}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/purchases" className="block text-center text-primary font-bold mt-4 hover:underline">View All POs →</Link>
        </div>
        
        <div className="bg-indigo-50 p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to supply more?</h3>
          <p className="text-gray-600 mb-6 max-w-sm">Browse the catalog to see which warehouses are running low on stock and place new wholesale orders instantly.</p>
          <Link to="/shop" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all">
            Go to Supplier Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
