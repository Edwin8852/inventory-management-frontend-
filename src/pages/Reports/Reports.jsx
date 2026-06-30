import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  LineChart as LineChartIcon 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overall');

  const lineChartData = [
    { name: 'Jan', sales: 80000, purchases: 40000 },
    { name: 'Feb', sales: 110000, purchases: 60000 },
    { name: 'Mar', sales: 90000, purchases: 50000 },
    { name: 'Apr', sales: 159000, purchases: 80000 },
    { name: 'May', sales: 130000, purchases: 95000 },
    { name: 'Jun', sales: 129000, purchases: 140000 },
    { name: 'Jul', sales: 180000, purchases: 90000 },
    { name: 'Aug', sales: 140000, purchases: 70000 },
    { name: 'Sep', sales: 190000, purchases: 110000 },
  ];

  const pieChartData = [
    { name: 'Denim Jeans', value: 399000, percentage: '45.00%' },
    { name: 'T-Shirts', value: 129000, percentage: '15.00%' },
    { name: 'Shirts', value: 229000, percentage: '13.50%' },
    { name: 'Others', value: 150000, percentage: '26.50%' }
  ];

  const pieColors = ['#0ea5e9', '#6366f1', '#a855f7', '#d946ef'];

  const supplierData = [
    { name: 'Apex Textile Mills', purchase: '4,59,000', paid: '5,59,000', balance: '14,89,000' },
    { name: 'Elite Fashion Hub', purchase: '6,00,00,000', paid: '2,09,000', balance: '1,29,000' },
    { name: 'Prime Garments', purchase: '1,00,00,000', paid: '1,39,000', balance: '1,39,000' },
  ];

  const customerData = [
    { name: 'Customer Store Name', billing: '1,81,000', received: '2,00,000', balance: '6,80,000' },
    { name: 'Elite Fashion Hub', billing: '1,24,000', received: '2,00,000', balance: '6,80,000' },
    { name: 'Urban Outfitters', billing: '1,51,000', received: '2,00,000', balance: '6,80,000' },
  ];

  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-bold text-gray-900">₹{entry.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600 font-medium">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Apr 10, 2024</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('overall')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'overall' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Overall Summary
          {activeTab === 'overall' && (
             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('supplier')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'supplier' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Supplier Reports
          {activeTab === 'supplier' && (
             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('customer')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'customer' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Customer Reports
          {activeTab === 'customer' && (
             <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Sales Revenue</h3>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-black text-gray-900 tracking-tight">₹1,245,000</span>
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>51.7%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Average to Trend</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Purchase Expense</h3>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-black text-gray-900 tracking-tight">₹579,000</span>
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingDown className="w-3 h-3" />
              <span>3.5%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Purchase Expense</p>
        </div>

        {/* Card 3 (Violet) */}
        <div className="bg-indigo-600 p-5 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-sm font-semibold text-white/90">Net Profit Margin</h3>
          </div>
          <div className="flex items-baseline gap-3 mb-1 relative z-10">
            <span className="text-3xl font-black text-white tracking-tight">₹666,000</span>
          </div>
          <p className="text-xs text-white/80 font-medium relative z-10">Net Profit Margin</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Current Inventory Stock Value</h3>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-black text-gray-900 tracking-tight">₹1,850,000</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Inventory Stock Value</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Monthly Sales vs. Monthly Purchases</h2>
            <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
              <LineChartIcon className="w-4 h-4" />
              <span>Timeline</span>
            </button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={formatYAxis}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="Sales"
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  activeDot={{ r: 6, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="purchases" 
                  name="Purchases"
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPurchases)" 
                  activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top-Selling Categories</h2>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend to match design */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full mt-4">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pieColors[index] }}></div>
                    <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                  </div>
                  <div className="pl-4">
                     <span className="text-sm font-bold text-gray-900">₹{item.value.toLocaleString('en-IN')}</span>
                     <span className="text-xs text-gray-400 ml-1">({item.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Summary view</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b border-gray-100">Supplier Name</th>
                  <th className="p-4 border-b border-gray-100">Total Purchase Value (₹)</th>
                  <th className="p-4 border-b border-gray-100">Paid Amount (₹)</th>
                  <th className="p-4 border-b border-gray-100">Outstanding Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {supplierData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{row.name}</td>
                    <td className="p-4 text-gray-600">₹ {row.purchase}</td>
                    <td className="p-4 text-gray-600">₹ {row.paid}</td>
                    <td className="p-4 text-gray-600">₹ {row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Customer view</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b border-gray-100">Customer Store Name</th>
                  <th className="p-4 border-b border-gray-100">Total Billing (₹)</th>
                  <th className="p-4 border-b border-gray-100">Total Received (₹)</th>
                  <th className="p-4 border-b border-gray-100">Ledger Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {customerData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{row.name}</td>
                    <td className="p-4 text-gray-600">₹ {row.billing}</td>
                    <td className="p-4 text-gray-600">₹ {row.received}</td>
                    <td className="p-4 text-gray-600">₹ {row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
