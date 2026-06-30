import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Loader2, AlertCircle, TrendingUp, IndianRupee, Package, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { purchaseService } from '../../services/purchase.service';
import Modal from '../../components/ui/Modal';
import CreatePurchaseModal from './CreatePurchaseModal';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';

const Purchases = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getPurchases();
      // Ensure data is array
      setPurchases(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setPurchases([]);
      } else {
        showError('Failed to fetch purchases.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const handleViewPurchase = async (purchase) => {
    try {
      const res = await purchaseService.getPurchaseById(purchase.id);
      setCurrentPurchase(res.data.data);
      setIsViewModalOpen(true);
    } catch (err) {
      showError('Failed to fetch purchase details.');
    }
  };

  const updateStatus = async (status) => {
    setStatusLoading(true);
    try {
      await purchaseService.updatePurchaseStatus(currentPurchase.id, status);
      showSuccess(`Purchase Order marked as ${status}.`);
      setIsViewModalOpen(false);
      fetchPurchases();
    } catch (err) {
      showError('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.Supplier?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Delivered</span>;
      case 'Completed': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3 mr-1"/> Completed</span>;
      case 'Processing': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3 h-3 mr-1"/> Processing</span>;
      case 'Approved': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>;
      case 'Cancelled': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"><FileText className="w-3 h-3 mr-1"/> {status || 'Draft'}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage supplier orders, track deliveries, and ingest stock.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" /> New Purchase Order
        </button>
      </div>

      {/* Alerts */}
      {successMsg && <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-medium rounded-xl shadow-sm flex items-center animate-in fade-in slide-in-from-top-2"><CheckCircle className="w-5 h-5 mr-2"/>{successMsg}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl shadow-sm flex items-center animate-in fade-in slide-in-from-top-2"><AlertCircle className="w-5 h-5 mr-2"/>{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center group">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-105 transition-transform"><Package className="w-7 h-7" /></div>
          <div><p className="text-sm text-gray-500 font-semibold mb-1">Total Orders</p><p className="text-3xl font-black text-gray-800 tracking-tight">{purchases.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center group">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-105 transition-transform"><TrendingUp className="w-7 h-7" /></div>
          <div><p className="text-sm text-gray-500 font-semibold mb-1">Pending Delivery</p><p className="text-3xl font-black text-gray-800 tracking-tight">{purchases.filter(p => p.status !== 'Delivered' && p.status !== 'Cancelled').length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center group">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-600 text-white rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-105 transition-transform"><IndianRupee className="w-7 h-7" /></div>
          <div><p className="text-sm text-gray-500 font-semibold mb-1">Total Spent</p><p className="text-2xl font-black text-gray-800 tracking-tight">{formatCurrency(purchases.reduce((acc, p) => acc + Number(p.totalAmount || 0), 0))}</p></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by PO Number or Supplier..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-bold">PO Number</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Supplier</th>
                <th className="px-6 py-4 font-bold">Total Amount</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-500"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" /><p className="font-medium text-gray-600">Loading purchase orders...</p></td></tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-gray-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-700">No purchase entries found</p>
                    <p className="text-sm text-gray-500 mt-2">Create a new purchase order to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-800">{po.poNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{new Date(po.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 font-semibold text-primary">{po.Supplier?.companyName || 'Unknown'}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatCurrency(po.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleViewPurchase(po)} className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center">
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Purchase Details: ${currentPurchase?.poNumber}`}>
        {currentPurchase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Supplier</p><p className="font-bold text-gray-900 text-lg">{currentPurchase.Supplier?.companyName}</p></div>
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Purchase Status</p>{getStatusBadge(currentPurchase.status)}</div>
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Payment Method</p><p className="font-bold text-gray-800">{currentPurchase.paymentMethod || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Payment Status</p><p className={`font-bold ${currentPurchase.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{currentPurchase.paymentStatus || 'Pending'}</p></div>
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Amount</p><p className="font-black text-primary text-xl">{formatCurrency(currentPurchase.totalAmount)}</p></div>
              <div><p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Date</p><p className="font-semibold text-gray-800">{new Date(currentPurchase.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-gray-500"/> Order Items</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {currentPurchase.items?.length > 0 ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <th className="p-3 font-semibold">Product</th>
                        <th className="p-3 font-semibold text-center">Qty</th>
                        <th className="p-3 font-semibold text-right">Unit Price</th>
                        <th className="p-3 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentPurchase.items.map(item => (
                        <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-semibold text-gray-800">
                            {item.Product?.productName || 'Unknown'}
                            {item.variant?.size ? ` (${item.variant.size})` : ''}
                          </td>
                          <td className="p-3 text-center font-medium bg-gray-50/50">{item.quantity}</td>
                          <td className="p-3 text-right text-gray-600">{formatCurrency(item.wholesalePrice)}</td>
                          <td className="p-3 text-right font-bold text-primary">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500 bg-white">No items found for this PO.</div>
                )}
              </div>
            </div>

            {/* Status actions — Admin only */}
            {isAdmin && currentPurchase.status === 'Draft' && (
              <div className="flex space-x-4 pt-6 border-t border-gray-100">
                <button disabled={statusLoading} onClick={() => updateStatus('Approved')} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2"/> Approve PO
                </button>
                <button disabled={statusLoading} onClick={() => updateStatus('Cancelled')} className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center justify-center border border-red-200">
                  <XCircle className="w-5 h-5 mr-2"/> Cancel PO
                </button>
              </div>
            )}
            
            {isAdmin && (currentPurchase.status === 'Approved' || currentPurchase.status === 'Processing') && (
              <div className="pt-6 border-t border-gray-100">
                <button disabled={statusLoading} onClick={() => updateStatus('Delivered')} className="w-full bg-success text-white py-3.5 rounded-xl font-bold hover:bg-green-600 shadow-md flex justify-center items-center transition-colors">
                  <Package className="w-5 h-5 mr-2"/> Mark as Delivered & Update Inventory
                </button>
                <div className="mt-3 flex items-start text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-500" />
                  <p>This action will permanently lock the Purchase Order and automatically increment the stock quantities in your inventory.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create PO Modal */}
      <CreatePurchaseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onPurchaseCreated={fetchPurchases} 
      />
    </div>
  );
};

export default Purchases;
