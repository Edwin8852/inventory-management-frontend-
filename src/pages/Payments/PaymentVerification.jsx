import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/payment.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { CheckCircle, XCircle, Loader2, CreditCard, Search, FileText } from 'lucide-react';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments();
      // Filter only UPI payments that need verification or show all UPI payments
      const upiPayments = (res.data.data || []).filter(p => p.paymentMethod === 'UPI');
      setPayments(upiPayments);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      setVerifying(id);
      await paymentService.verifyPayment(id, status);
      fetchPayments(); // Refresh list to get updated statuses
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <CreditCard className="w-8 h-8" />
        <div>
          <h1 className="text-2xl font-extrabold">UPI Payments Verification</h1>
          <p className="text-indigo-100 text-sm">Review and approve or reject UPI payments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">UTR Number</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No UPI payments found.
                  </td>
                </tr>
              ) : payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {payment.Order ? payment.Order.orderNumber : payment.PurchaseOrder ? payment.PurchaseOrder.poNumber : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold bg-indigo-50/50 rounded p-1 inline-block mt-2">
                    {payment.utrNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                      ${payment.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' : 
                        payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {payment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {payment.status === 'PENDING_VERIFICATION' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerify(payment.id, 'PAID')}
                          disabled={verifying === payment.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {verifying === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerify(payment.id, 'FAILED')}
                          disabled={verifying === payment.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {verifying === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-semibold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
