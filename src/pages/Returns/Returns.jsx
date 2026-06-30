import React, { useState, useEffect } from 'react';
import { returnService } from '../../services/return.service';
import { invoiceService } from '../../services/invoice.service';
import { RefreshCcw, Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import Modal from '../../components/ui/Modal';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  
  const [invoiceLookup, setInvoiceLookup] = useState('');
  const [lookedUpInvoice, setLookedUpInvoice] = useState(null);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Size Issue');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await returnService.getReturns();
      setReturns(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch returns', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!invoiceLookup) return;
    try {
      // Find the invoice logic. We would need a search endpoint. 
      // For now, we fetch all and filter (demo logic).
      const res = await invoiceService.getInvoices();
      const invoice = res.data.data.find(inv => inv.invoiceNumber === invoiceLookup);
      
      if (invoice) {
        setLookedUpInvoice(invoice);
        setErrorMsg(null);
      } else {
        setErrorMsg('Invoice not found');
        setLookedUpInvoice(null);
      }
    } catch (err) {
      setErrorMsg('Failed to lookup invoice');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedItem) return setErrorMsg('Select an item to return');
    if (returnQty > selectedItem.quantity) return setErrorMsg('Return quantity exceeds purchased quantity');

    setProcessLoading(true);
    try {
      const refundAmount = selectedItem.unitPrice * returnQty;
      await returnService.processReturn({
        invoiceId: lookedUpInvoice.id,
        productId: selectedItem.productId,
        quantity: returnQty,
        reason: returnReason,
        refundAmount
      });
      
      setIsModalOpen(false);
      fetchReturns();
      // Reset form
      setLookedUpInvoice(null);
      setInvoiceLookup('');
      setSelectedItem(null);
    } catch (err) {
      setErrorMsg('Failed to process return');
    } finally {
      setProcessLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Returns & Exchanges</h1>
          <p className="text-sm text-gray-500">Process refunds, accept returned stock, and log reasons.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Process Return
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" placeholder="Search returns..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Refund Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{ret.Invoice?.invoiceNumber || 'Unknown'}</td>
                    <td className="p-4 text-gray-700">{ret.Product?.productName || 'Unknown Item'}</td>
                    <td className="p-4 text-gray-600 text-sm">{ret.reason}</td>
                    <td className="p-4 text-center font-bold">{ret.quantity}</td>
                    <td className="p-4 text-right font-bold text-danger">-{formatCurrency(ret.refundAmount)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-green-50 text-success text-xs font-bold rounded">
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No returns processed yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Process New Return">
        <div className="space-y-4">
          <form onSubmit={handleLookup} className="flex gap-2">
            <input 
              type="text" required placeholder="Enter Invoice Number" 
              value={invoiceLookup} onChange={(e) => setInvoiceLookup(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg">Lookup</button>
          </form>

          {errorMsg && <p className="text-danger text-sm font-medium">{errorMsg}</p>}

          {lookedUpInvoice && (
            <form onSubmit={handleSubmitReturn} className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item to Return</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => setSelectedItem(lookedUpInvoice.items.find(i => i.id === e.target.value))}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select Item</option>
                  {lookedUpInvoice.items?.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.Product?.productName} (Qty: {item.quantity}) - {formatCurrency(item.unitPrice)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Quantity</label>
                    <input 
                      type="number" min="1" max={selectedItem.quantity} required
                      value={returnQty} onChange={(e) => setReturnQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                    <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold">
                      {formatCurrency(selectedItem.unitPrice * returnQty)}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select 
                  value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>Size Issue</option>
                  <option>Defective Product</option>
                  <option>Color Mismatch</option>
                  <option>Customer Changed Mind</option>
                </select>
              </div>

              <button type="submit" disabled={processLoading} className="w-full py-3 bg-primary text-white font-bold rounded-lg mt-4 flex justify-center items-center">
                {processLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Return & Restock'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Returns;
