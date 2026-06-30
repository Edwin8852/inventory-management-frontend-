import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { X, Printer } from 'lucide-react';

const PurchaseInvoiceView = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Group items by product to show variants as badges
  const groupedItems = invoice.items?.reduce((acc, item) => {
    const pId = item.productId;
    if (!acc[pId]) {
      acc[pId] = {
        product: item.Product,
        description: item.Product?.productName || 'Unknown Product',
        costPrice: item.unitPrice,
        totalQuantity: 0,
        totalAmount: 0,
        variants: []
      };
    }
    acc[pId].totalQuantity += item.quantity;
    acc[pId].totalAmount += parseFloat(item.total);
    if (item.variant?.size) {
      acc[pId].variants.push({ size: item.variant.size, qty: item.quantity });
    }
    return acc;
  }, {});

  const displayItems = groupedItems ? Object.values(groupedItems) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:block overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl my-8 rounded-xl shadow-2xl relative print:w-full print:max-w-none print:shadow-none print:my-0 print:rounded-none">
        
        {/* Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-end gap-3 p-4 border-b border-gray-100 print:hidden bg-gray-50 rounded-t-xl">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Paper Area */}
        <div className="p-12 print:p-0 bg-white">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">GARMENTS ERP</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium tracking-wide">Enterprise Supply Chain Solutions</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-indigo-600 tracking-tight">PURCHASE INVOICE</h2>
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-3 gap-6 mb-10 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Invoice No</p>
              <p className="text-gray-900 font-bold">{invoice.invoiceNumber || 'INV-S-2026-0001'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Date</p>
              <p className="text-gray-900 font-bold">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Place of Supply</p>
              <p className="text-gray-900 font-bold">Delhi (07)</p>
            </div>
          </div>

          {/* Addresses & Parties Section */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Supplier (From)</h3>
              <p className="text-lg font-bold text-gray-900 mb-1">{invoice.Order?.Supplier?.companyName || 'Apex Textile & Denim Mills Pvt Ltd'}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {invoice.Order?.Supplier?.address || 'Plot No 45, Phase 2, Industrial Area\nNew Delhi, India - 110020'}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                GSTIN: <span className="font-bold">{invoice.Order?.Supplier?.gstin || '07AAACA4102B1Z4'}</span>
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Buyer / Billing To</h3>
              <p className="text-lg font-bold text-gray-900 mb-1">Garments ERP Solutions Co.</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Corporate Office, Cyber Hub Tower B<br/>
                Gurugram, Haryana - 122002
              </p>
              <p className="text-sm font-semibold text-gray-900">
                GSTIN: <span className="font-bold">07AABCG8812M1Z0</span>
              </p>
            </div>
          </div>

          {/* Itemized Table Grid */}
          <div className="mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider w-16 text-center border-r border-indigo-500">S.No</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider w-32 border-r border-indigo-500">Product ID</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider border-r border-indigo-500">Product Description</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-right w-32 border-r border-indigo-500">Cost Price</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-right w-24 border-r border-indigo-500">Bulk Qty</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-right w-36">Taxable Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {displayItems.length > 0 ? displayItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-500 text-center align-top border-r border-gray-200">{idx + 1}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 align-top border-r border-gray-200">{item.product?.sku || `PRD-${idx + 1}`}</td>
                    <td className="py-4 px-4 align-top border-r border-gray-200">
                      <p className="text-sm font-bold text-gray-900 mb-2">{item.description}</p>
                      {item.variants.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.variants.map((v, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Size {v.size}: {v.qty} pcs
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium align-top border-r border-gray-200">
                      {formatCurrency(item.costPrice)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-bold align-top border-r border-gray-200">
                      {item.totalQuantity}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-bold align-top">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-sm text-gray-500">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Remittance Footer */}
          <div className="grid grid-cols-2 gap-12">
            
            {/* Left: Bank Details */}
            <div>
              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  Bank Payment Remittance Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Bank Name:</span>
                    <span className="col-span-2 font-bold text-gray-900">HDFC Bank Ltd.</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Account No:</span>
                    <span className="col-span-2 font-bold text-gray-900">50200041238901</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">IFSC Code:</span>
                    <span className="col-span-2 font-bold text-gray-900">HDFC0001234</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-gray-500 italic">
                  Amount in Words: <span className="font-semibold text-gray-900">Indian Rupees Ninety-Five Thousand Two Hundred Only</span>
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Notes: All disputes are subject to local jurisdiction.
                </p>
              </div>
            </div>

            {/* Right: Calculations */}
            <div>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-3 bg-white">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(invoice.subTotal || 85000)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">CGST @ 6%</span>
                    <span className="text-gray-900 font-bold">{formatCurrency((invoice.gstAmount || 10200) / 2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">SGST @ 6%</span>
                    <span className="text-gray-900 font-bold">{formatCurrency((invoice.gstAmount || 10200) / 2)}</span>
                  </div>
                </div>
                <div className="p-5 bg-indigo-50 border-t border-indigo-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-indigo-900">Grand Total</span>
                    <span className="text-2xl font-black text-indigo-700">{formatCurrency(invoice.totalAmount || 95200)}</span>
                  </div>
                </div>
              </div>

              {/* Signature Line */}
              <div className="mt-16 text-right">
                <div className="w-48 border-b-2 border-gray-800 ml-auto mb-2"></div>
                <p className="text-sm font-bold text-gray-900">Authorized Signatory</p>
                <p className="text-xs text-gray-500">{invoice.Order?.Supplier?.companyName || 'Supplier Name'}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceView;
