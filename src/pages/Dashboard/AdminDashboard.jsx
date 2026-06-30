import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Users, AlertCircle, 
  ArrowUpRight, ArrowDownRight, BarChart3, Receipt 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { orderService } from '../../services/order.service';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalCustomers: 0, totalOrders: 0, totalRevenue: 0, lowStockCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        const data = res.data.data;
        setStats({
          totalProducts: data.totalProducts || 0,
          totalCustomers: data.totalCustomers || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          lowStockCount: data.lowStockProducts || 0
        });
        const orderRes = await orderService.getOrders().catch(() => ({ data: { data: [] } }));
        setRecentOrders((orderRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  const kpis = [
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50", trend: "+12.5%" },
    { title: "Total Orders", value: stats.totalOrders, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50", trend: "+5.2%" },
    { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+18.1%" },
    { title: "Low Stock Items", value: stats.lowStockCount, icon: AlertCircle, color: "text-danger", bg: "bg-red-50", trend: "-2" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <p className="text-sm text-gray-500">System-wide performance metrics and alerts.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center shadow-sm">
          <BarChart3 className="w-4 h-4 mr-2" /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-black text-gray-800">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}><kpi.icon className={`w-6 h-6 ${kpi.color}`} /></div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium flex items-center ${kpi.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {kpi.trend}
              </span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Revenue Analytics</h3>
            <select className="text-sm border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-600 outline-none">
              <option>This Week</option><option>This Month</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={[
                { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 }, { name: 'Wed', revenue: 5000 },
                { name: 'Thu', revenue: 2780 }, { name: 'Fri', revenue: 6890 }, { name: 'Sat', revenue: 8390 }, { name: 'Sun', revenue: 7490 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center text-gray-400 mt-10"><Receipt className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No recent transactions</p></div>
            ) : (
              recentOrders.map((order, i) => (
                <div key={order.id || i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-xs mr-3">
                      {order.orderNumber ? order.orderNumber.slice(-4) : 'POS'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{order.Customer?.name || 'Walk-in'}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className="text-[10px] bg-green-50 text-success px-2 py-0.5 rounded-full font-medium">{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
