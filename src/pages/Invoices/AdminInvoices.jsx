import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Download, 
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PurchaseInvoiceView from './PurchaseInvoiceView';

const AdminInvoices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const itemsPerPage = 3;

  const kpis = [
    {
      title: "Total Sales Revenue",
      value: "₹4,82,450.00",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      iconBg: "bg-emerald-50"
    },
    {
      title: "Pending Receivables",
      value: "₹1,15,670.00",
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-50"
    },
    {
      title: "Paid Invoices",
      value: "128",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      iconBg: "bg-emerald-50"
    },
    {
      title: "Supplier Payments Due",
      value: "₹59,200.00",
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      iconBg: "bg-purple-50"
    }
  ];

  const invoiceData = [
    {
      id: "INV-C-2026-0001",
      type: "ADMIN",
      date: "06/09/2026",
      status: "Pending",
      amount: "₹4,82,450.00"
    },
    {
      id: "INV-A-2026-0001",
      type: "CUSTOMER",
      date: "06/09/2026",
      status: "Pending",
      amount: "₹1,15,670.00"
    },
    {
      id: "INV-S-2026-0001",
      type: "SUPPLIER",
      date: "06/09/2026",
      status: "Pending",
      amount: "₹59,200.00"
    },
    {
      id: "INV-2026-0042",
      type: "ADMIN",
      date: "06/09/2026",
      status: "Pending",
      amount: "₹59,200.00"
    }
  ];

  const getTypeStyle = (type) => {
    switch(type) {
      case 'ADMIN':
        return 'bg-gray-100 text-gray-700';
      case 'CUSTOMER':
        return 'bg-blue-50 text-blue-600';
      case 'SUPPLIER':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'Pending') {
      return 'bg-amber-50 text-amber-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const filteredInvoices = invoiceData.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.amount.includes(searchQuery);
    const matchesType = filterType === 'ALL' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Admin Invoices Hub</h1>
        <p className="text-sm text-gray-500 font-medium">View and manage all system invoices (Admin, Supplier, Customer)</p>
      </div>

      {/* Top Row KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Data Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Search & Filters Control Bar */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50"
            />
          </div>
          
          <div className="relative">
            <select 
              value={filterType} 
              onChange={handleFilterChange}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="ALL">Type: All type</option>
              <option value="ADMIN">Type: Admin</option>
              <option value="CUSTOMER">Type: Customer</option>
              <option value="SUPPLIER">Type: Supplier</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Data Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice No</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedInvoices.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-900">{row.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${getTypeStyle(row.type)}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-600">{row.date}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-gray-900">{row.amount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          const totalAmt = parseInt(row.amount.replace(/[^0-9]/g, ''), 10) / 100;
                          const subTotal = totalAmt / 1.12;
                          const gstAmount = totalAmt - subTotal;
                          
                          setViewingInvoice({ 
                            invoiceNumber: row.id, 
                            createdAt: new Date(row.date), 
                            totalAmount: totalAmt,
                            subTotal: subTotal,
                            gstAmount: gstAmount,
                            invoiceType: row.type,
                            items: [
                              {
                                productId: 'PRD-001',
                                Product: { productName: 'Premium Denim Jeans - Bulk' },
                                unitPrice: subTotal / 100,
                                quantity: 100,
                                total: subTotal,
                                variant: { size: 'Various' }
                              }
                            ]
                          });
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-bold text-gray-900">{filteredInvoices.length}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:hover:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                  currentPage === pageNum 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:hover:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
      
      {viewingInvoice && (
        <PurchaseInvoiceView 
          invoice={viewingInvoice} 
          onClose={() => setViewingInvoice(null)} 
        />
      )}
    </div>
  );
};

export default AdminInvoices;
