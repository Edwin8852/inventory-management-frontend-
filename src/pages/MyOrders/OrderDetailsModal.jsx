import React from 'react';
import { 
  X, Package, Calendar, CreditCard, Banknote, Download, 
  Truck, Phone, MapPin, CheckCircle, Clock 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { API_BASE_URL } from '../../utils/constants';

const baseUrl = API_BASE_URL.replace('/api', '');

const OrderDetailsModal = ({ isOpen, onClose, order, isSupplier }) => {
  if (!isOpen || !order) return null;

  const orderNum = isSupplier ? order.poNumber : order.orderNumber;
  const address = isSupplier ? order.Supplier?.address : order.Customer?.address;
  const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7));
  
  const getPaymentIcon = () => {
    if (order.paymentMethod?.toUpperCase() === 'CASH') return <Banknote className="w-5 h-5 text-emerald-600" />;
    return <CreditCard className="w-5 h-5 text-indigo-600" />;
  };

  const isCompleted = order.status === 'Completed' || order.status === 'Delivered';
  const displayPaymentStatus = (!order.paymentStatus || order.paymentStatus.toUpperCase() === 'PENDING') ? 'PAID' : order.paymentStatus.toUpperCase();
  const paymentMethodName = order.paymentMethod ? (order.paymentMethod.toUpperCase() === 'CASH' ? 'Cash' : 'UPI') : 'Cash';

  // Tracking Stepper Logic
  const steps = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
  
  // Normalize PO statuses to fit the visual stepper if it's a PO
  let currentStatusIndex = steps.indexOf(order.status);
  if (isSupplier) {
    if (order.status === 'Draft') currentStatusIndex = 0;
    if (order.status === 'PLACED') currentStatusIndex = 0;
    if (order.status === 'Completed') currentStatusIndex = 5;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 opacity-100 transition-opacity duration-300">
      <div 
        className="w-full max-w-5xl bg-gray-50 flex flex-col transform transition-all duration-300 overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
        style={{ borderRadius: '24px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Gradient Header */}
        <div 
          className="px-8 py-6 text-white relative shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #7C3AED 100%)' }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-8 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold tracking-tight">Order #{orderNum}</h2>
          </div>
          <p className="text-white/80 text-sm font-medium ml-10">
            Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Status Card */}
            <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${isCompleted ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-blue-50 text-blue-700'}`}>
                  <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-[#166534]' : 'bg-blue-600'}`}></span>
                  {order.status || 'Confirmed'}
                </span>
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  {getPaymentIcon()}
                </div>
                <span className="font-bold text-gray-800 text-lg">{paymentMethodName}</span>
              </div>
            </div>

            {/* Total Amount Card */}
            <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-[32px] font-bold text-[#4F46E5] leading-none tracking-tight">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>

            {/* Delivery Card */}
            <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expected Delivery</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="font-bold text-gray-800 text-lg">
                  {isCompleted ? 'Delivered' : deliveryDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Tracking Stepper */}
          <div id="tracking-section" className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.04)] p-6 md:p-8 mb-8">
            <h3 className="font-bold text-gray-800 mb-8 text-lg">Delivery Tracking</h3>
            <div className="relative flex justify-between items-start max-w-4xl mx-auto">
              {/* Connecting Line background */}
              <div className="absolute top-4 left-0 w-full h-1 bg-[#E5E7EB] rounded-full z-0 translate-y-[-50%]"></div>
              
              {/* Connecting Line active */}
              {currentStatusIndex >= 0 && (
                <div 
                  className="absolute top-4 left-0 h-1 bg-[#4F46E5] rounded-full z-0 translate-y-[-50%] transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
                ></div>
              )}

              {steps.map((step, idx) => {
                const isActive = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center w-16 sm:w-24">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 
                        ${isActive ? 'bg-[#4F46E5]' : 'bg-[#E5E7EB]'}`}
                    >
                      {isActive && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-bold mt-3 text-center transition-colors 
                      ${isCurrent ? 'text-[#4F46E5]' : isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step}
                    </span>
                    {idx === 0 && <span className="text-[10px] text-gray-400 font-medium mt-1 text-center">{new Date(order.createdAt).toLocaleDateString()}</span>}
                    {idx === 5 && isCompleted && <span className="text-[10px] text-gray-400 font-medium mt-1 text-center">{new Date(order.updatedAt).toLocaleDateString()}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-4">
            
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 flex flex-shrink-0 items-center justify-center p-2">
                      {item.Product?.image 
                        ? <img src={`${baseUrl}${item.Product.image}`} className="w-full h-full object-contain" alt="product" />
                        : <Package className="w-8 h-8 text-gray-300" />
                      }
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-900 text-lg leading-tight">
                          {item.Product?.productName || 'Unknown Product'}
                          {item.variant?.size && <span className="ml-2 text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Size: {item.variant.size}</span>}
                        </p>
                        <p className="font-black text-gray-900 text-lg">{formatCurrency(item.total)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-2">
                        <span>SKU: {item.Product?.sku || 'N/A'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Unit Price: {formatCurrency(isSupplier ? item.wholesalePrice : item.retailPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              
              {/* Delivery Info Card */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-500" /> Delivery Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 font-semibold mb-0.5">Shipping Address</p>
                    <p className="text-gray-800 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {address || 'No address provided on profile.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-400 font-semibold">Shipping Method</span>
                    <span className="text-gray-800 font-bold">Standard Delivery</span>
                  </div>
                  <button className="w-full mt-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> View On Map
                  </button>
                </div>
              </div>

              {/* Payment Info Card */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" /> Payment Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-400 font-semibold">Payment Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${displayPaymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {displayPaymentStatus}
                    </span>
                  </div>
                  {paymentMethodName === 'UPI' && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-semibold">Transaction ID</span>
                      <span className="text-gray-800 font-mono font-bold text-xs">
                        {order.utrNumber || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 font-semibold">Date Paid</span>
                    <span className="text-gray-800 font-bold">
                      {displayPaymentStatus === 'PAID' ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[12px] transition-colors"
          >
            Close
          </button>

          <button className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Download Invoice
          </button>
          <button 
            onClick={() => document.getElementById('tracking-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="w-full sm:w-auto px-8 py-2.5 text-white font-bold rounded-[12px] shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
