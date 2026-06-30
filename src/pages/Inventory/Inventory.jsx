import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Layers, Activity, ArrowRightLeft, RefreshCw } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

const Inventory = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // { type: 'IN'|'OUT'|'TRANSFER', variant }
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchVariants(); }, []);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stock/overview');
      setVariants(res.data.data || []);
    } catch { showError('Failed to fetch inventory.'); }
    finally { setLoading(false); }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 5000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const openModal = (type, variant) => {
    setModal({ type, variant });
    setQty(1);
    setNotes('');
    setError(null);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { variantId: modal.variant.id, quantity: Number(qty), reference: notes || `Manual ${modal.type}` };
      if (modal.type === 'IN') await api.post('/stock/in', payload);
      else if (modal.type === 'OUT') await api.post('/stock/out', payload);
      else await api.post('/stock/transfer', payload);

      showSuccess(`Stock ${modal.type === 'TRANSFER' ? 'transferred to store' : modal.type} successful.`);
      setModal(null);
      fetchVariants();
    } catch (err) {
      showError(err.response?.data?.message || 'Stock adjustment failed.');
    } finally { setActionLoading(false); }
  };

  const filtered = variants.filter(v =>
    v.product?.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.size?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.color?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWarehouse = variants.reduce((s, v) => s + (v.warehouseStock || 0), 0);
  const totalStore = variants.reduce((s, v) => s + (v.storeStock || 0), 0);
  const lowStoreCount = variants.filter(v => v.storeStock > 0 && v.storeStock <= 10).length;
  const outStoreCount = variants.filter(v => v.storeStock <= 0).length;

  const getStockStatus = (store) => {
    if (store <= 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (store <= 10) return { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Healthy', cls: 'bg-green-100 text-green-700' };
  };

  const modalTitle = modal?.type === 'IN' ? 'Stock IN (Warehouse)'
    : modal?.type === 'OUT' ? 'Stock OUT (Store)'
    : 'Transfer: Warehouse → Store';

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>
        <p className="text-sm text-gray-500">Variant-level stock — Warehouse (incoming) vs Store (retail floor)</p>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-green-50 border-l-4 border-success text-success font-medium rounded">{successMsg}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-danger text-danger font-medium rounded">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center"><Layers className="w-6 h-6 text-primary" /></div>
          <div><p className="text-sm text-gray-500">Warehouse Total</p><p className="text-xl font-bold text-gray-800">{totalWarehouse}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center"><Activity className="w-6 h-6 text-success" /></div>
          <div><p className="text-sm text-gray-500">Store Total</p><p className="text-xl font-bold text-gray-800">{totalStore}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center"><ArrowDownRight className="w-6 h-6 text-warning" /></div>
          <div><p className="text-sm text-gray-500">Low Store Stock</p><p className="text-xl font-bold text-yellow-600">{lowStoreCount}</p></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-danger" /></div>
          <div><p className="text-sm text-gray-500">Out of Store Stock</p><p className="text-xl font-bold text-danger">{outStoreCount}</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search by product, SKU, size or color..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <button onClick={fetchVariants} className="ml-3 p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Product / Variant SKU</th>
                <th className="p-4 font-semibold">Size</th>
                <th className="p-4 font-semibold">Color</th>
                <th className="p-4 font-semibold text-indigo-600">Warehouse Stock</th>
                <th className="p-4 font-semibold text-green-600">Store Stock</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
                  <p>No inventory records found.</p>
                </td></tr>
              ) : filtered.map(v => {
                const { label, cls } = getStockStatus(v.storeStock);
                return (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{v.product?.productName}</p>
                      <p className="text-xs font-mono text-gray-400">{v.sku || v.product?.sku}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{v.size}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{v.color}</td>
                    <td className="p-4">
                      <span className="text-2xl font-bold text-indigo-700">{v.warehouseStock ?? 0}</span>
                      <span className="text-xs text-gray-400 ml-1">units</span>
                    </td>
                    <td className="p-4">
                      <span className="text-2xl font-bold text-green-700">{v.storeStock ?? 0}</span>
                      <span className="text-xs text-gray-400 ml-1">units</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cls}`}>{label}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal('IN', v)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> Stock IN
                        </button>
                        <button onClick={() => openModal('TRANSFER', v)}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100 flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Transfer
                        </button>
                        <button onClick={() => openModal('OUT', v)}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3" /> Stock OUT
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modalTitle}>
        {modal && (
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold text-gray-800">{modal.variant.product?.productName}</p>
              <p className="text-gray-500">Size: <strong>{modal.variant.size}</strong> | Color: <strong>{modal.variant.color}</strong></p>
              <div className="flex gap-4 pt-1">
                <span className="text-indigo-700 font-bold">Warehouse: {modal.variant.warehouseStock}</span>
                <span className="text-green-700 font-bold">Store: {modal.variant.storeStock}</span>
              </div>
            </div>

            {modal.type === 'TRANSFER' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-700 text-sm">
                ℹ️ Transfer moves stock from <strong>Warehouse → Store</strong>. Enter the quantity to move.
              </div>
            )}
            {modal.type === 'IN' && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 text-sm">
                ℹ️ Stock IN adds to <strong>Warehouse Stock</strong> (e.g. goods received from supplier).
              </div>
            )}
            {modal.type === 'OUT' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                ⚠️ Stock OUT deducts from <strong>Store Stock</strong> (e.g. damage write-off).
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" required min="1" value={qty} onChange={e => setQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Notes</label>
              <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Purchase Order #123, Audit correction..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-danger text-sm">{error}</div>}

            <div className="pt-3 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">Cancel</button>
              <button type="submit" disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-lg font-medium flex items-center ${
                  modal.type === 'IN' ? 'bg-indigo-600 hover:bg-indigo-700'
                  : modal.type === 'TRANSFER' ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-danger hover:bg-red-600'
                }`}>
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm {modal.type === 'TRANSFER' ? 'Transfer' : `Stock ${modal.type}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
