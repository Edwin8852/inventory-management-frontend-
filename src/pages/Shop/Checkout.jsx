import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Loader2, CheckCircle, AlertCircle, Package,
  CreditCard, Banknote, Smartphone, ArrowLeft, MapPin
} from 'lucide-react';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { purchaseService } from '../../services/purchase.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';

// ─── QR Code display for UPI ─────────────────────────────────────────────────
const UPI_ID = 'bgmkingedwin8486w@okhdfcbank';
const BANK_NAME = 'State Bank Of India';

const UpiPayment = ({ total, onConfirm, loading }) => {
  const [showUtr, setShowUtr] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  if (showUtr) {
    return (
      <div className="space-y-5 animate-fade-in border border-indigo-100 rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-bold text-gray-800 text-center">Verify Payment</h3>
        <p className="text-sm text-gray-500 text-center mb-4">Please enter the Payment Reference Number (UTR) from your UPI transaction.</p>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Payment Reference Number (UTR)</label>
          <input 
            type="text" 
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder="e.g. 123456789012"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-wide"
          />
        </div>
        <button
          onClick={() => onConfirm(utrNumber)}
          disabled={loading || utrNumber.length < 6}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
          {loading ? 'Processing...' : 'Submit Payment'}
        </button>
        <button onClick={() => setShowUtr(false)} disabled={loading} className="w-full text-center text-sm text-gray-500 font-semibold hover:text-gray-700 mt-2">
          Cancel & Back to QR Code
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4">
        <p className="text-lg font-bold text-gray-800">Scan QR To Pay</p>
        <p className="text-sm font-semibold text-gray-600">Order Amount:</p>
        <div className="text-2xl font-black text-indigo-700 mt-0">{formatCurrency(total)}</div>
        {/* Dynamic QR Code */}
        <div className="flex justify-center my-4">
          <div className="bg-white p-3 rounded-2xl shadow-md inline-block border border-gray-200">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=Edwin&am=${total.toFixed(2)}&cu=INR`}
              alt="Dynamic QR"
              className="w-48 h-48"
              onError={e => e.target.style.display='none'}
            />
          </div>
        </div>
        <div className="text-sm space-y-1">
          <p className="font-bold text-gray-700">UPI ID:</p>
          <p className="font-mono text-indigo-700 font-bold text-base bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 inline-block select-all">{UPI_ID}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium">
        📱 Scan the QR code or use the UPI ID above to pay. Then click "I Have Paid" to confirm.
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowUtr(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <CheckCircle className="w-6 h-6" />
          I HAVE PAID
        </button>
        <button
          onClick={() => {/* Cancel logic if any */}}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-lg transition-all"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

// ─── Cash Payment ──────────────────────────────────────────────────────────────
const CashPayment = ({ onConfirm, loading }) => (
  <div className="space-y-5">
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8 text-center space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Banknote className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">Cash Payment</h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        Your order will be placed successfully as <strong>Paid</strong> immediately.
        No pending approval required.
      </p>
      <div className="bg-white rounded-xl p-4 border border-green-100 text-sm text-gray-600 space-y-1">
        <div className="flex justify-between"><span>Payment Method</span><span className="font-bold text-gray-800">Cash</span></div>
        <div className="flex justify-between"><span>Payment Status</span><span className="font-bold text-green-600">Paid</span></div>
        <div className="flex justify-between"><span>Order Status</span><span className="font-bold text-green-600">Placed</span></div>
      </div>
    </div>

    <button
      onClick={onConfirm}
      disabled={loading}
      className="w-full bg-gray-900 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingCart className="w-6 h-6" />}
      {loading ? 'Placing Order...' : 'Place Order (Cash)'}
    </button>
  </div>
);

// ─── Main Checkout Component ───────────────────────────────────────────────────

const STEPS = ['Review', 'Payment', 'Confirm'];

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSupplier = user?.role === 'SUPPLIER';

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0=review, 1=payment, 2=done
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const cartData = res.data.data;
      if (!cartData?.items?.length) { navigate('/cart'); return; }
      setCart(cartData);
    } catch { navigate('/cart'); }
    finally { setLoading(false); }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const buildOrderItems = () => items.map(item => ({
    productId: item.productId,
    variantId: item.variantId || undefined,
    quantity: item.quantity,
    retailPrice: parseFloat(item.price),
    wholesalePrice: parseFloat(item.price),
    warehouseId: item.warehouseId || undefined,
  }));

  const placeOrder = async (utrNumber = null) => {
    if (!paymentMethod) { setError('Please select a payment method.'); return; }
    
    // Safety check for empty carts
    if (!items.length) { setError('Your cart is empty.'); return; }
    
    setSubmitting(true);
    setError(null);
    try {
      if (isSupplier) {
        const groupedByWarehouse = items.reduce((acc, item) => {
          const wh = item.warehouseId || 'default';
          if (!acc[wh]) acc[wh] = [];
          acc[wh].push(item);
          return acc;
        }, {});

        // Get supplierId from first item (all belong to the same supplier's cart)
        const firstWarehouse = Object.keys(groupedByWarehouse)[0];
        const whItems = groupedByWarehouse[firstWarehouse];
        
        if (firstWarehouse === 'default') {
          throw new Error('Please select a warehouse for your products before placing the Purchase Order.');
        }

        const payload = {
          warehouseId: firstWarehouse,
          paymentMethod: paymentMethod.toUpperCase(),
          utrNumber,
          items: whItems.map(i => ({
            productId: i.productId,
            variantId: i.variantId || undefined,
            quantity: i.quantity,
            wholesalePrice: parseFloat(i.price),
          }))
        };
        
        console.log('Submitting Purchase Order payload:', payload);
        const res = await purchaseService.createPurchase(payload);
        setOrderId(res.data.data?.poNumber || res.data.data?.id);
      } else {
        const payload = {
          paymentMethod: paymentMethod.toUpperCase(),
          utrNumber,
          items: buildOrderItems(),
        };
        
        console.log('Submitting Order payload:', payload);
        const res = await orderService.createOrder(payload);
        setOrderId(res.data.data?.orderNumber || res.data.data?.id);
      }
      
      alert("Order placed successfully.");
      navigate(isSupplier ? '/purchases' : '/my-orders');
      // setStep(2); // Skipped per requirement to redirect immediately
    } catch (err) {
      console.error("Order placement failed:", err);
      let errMsg = 'Failed to place order. Please try again.';
      if (err.message === 'Please select a warehouse for your products before placing the Purchase Order.') {
        errMsg = err.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errMsg = err.response.data.errors.join(', ');
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  // ─── Step 2: Order Placed ────────────────────────────────────────────────────
  if (step === 2) {
    const isPaid = paymentMethod === 'UPI';
    const isCash = paymentMethod === 'Cash';

    if (isCash) {
      return (
        <div className="max-w-lg mx-auto mt-10 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 text-center space-y-5">
            <h2 className="text-2xl font-extrabold text-green-600 mb-2">✅ PAYMENT SUCCESSFUL</h2>
            <h2 className="text-2xl font-extrabold text-green-600">✅ ORDER PLACED SUCCESSFULLY</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 text-base space-y-3 text-left border border-gray-100 mt-6">
              <div className="flex justify-between"><span className="text-gray-500">Order Number:</span><span className="font-bold">{orderId || 'ORD-XXXXXX'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Method:</span><span className="font-bold">Cash</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Status:</span><span className="font-bold text-green-600">Paid</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order Status:</span><span className="font-bold text-green-600">Placed</span></div>
            </div>
            
            <div className="pt-4">
              <button onClick={() => navigate('/orders')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md">
                View Orders
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto mt-10 animate-fade-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 text-center space-y-5">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${isPaid ? 'bg-green-100' : 'bg-amber-100'}`}>
            <CheckCircle className={`w-12 h-12 ${isPaid ? 'text-green-600' : 'text-amber-500'}`} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Order Placed!</h2>
          <p className="text-gray-500">
            {isPaid
              ? 'Your UPI payment is submitted for verification. Your order is now pending.'
              : 'Your cash order is placed. Payment will be collected upon delivery.'}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 text-left border border-gray-100">
            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-bold">{paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Status</span>
              <span className={`font-bold ${isPaid ? 'text-amber-600' : 'text-amber-600'}`}>{isPaid ? 'Pending Verification' : 'Cash Pending'}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Order Status</span>
              <span className={`font-bold ${isPaid ? 'text-blue-600' : 'text-amber-600'}`}>{isPaid ? 'Payment Pending' : 'Pending Payment'}</span>
            </div>
            <div className="flex justify-between border-t pt-2"><span className="text-gray-600 font-semibold">Total Paid</span><span className="font-black text-indigo-700 text-lg">{formatCurrency(total)}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/invoices')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all">View Invoice</button>
            <button onClick={() => navigate('/shop')} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition-all">Shop More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
        <h1 className="text-2xl font-extrabold">Checkout</h1>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full transition-all
                ${i === step ? 'bg-white text-indigo-700' : i < step ? 'bg-white/30 text-white' : 'text-white/50'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black
                  ${i < step ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/20" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="lg:col-span-2">
          {/* Step 0: Review Order */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-500" /> Review Your Order</h3>
              <div className="divide-y divide-gray-100">
                {items.map(item => {
                  const product = item.Product;
                  const variant = item.variant;
                  return (
                    <div key={item.id} className="flex items-center gap-4 py-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl border overflow-hidden flex items-center justify-center shrink-0">
                        {product?.image
                          ? <img src={`http://localhost:5000${product.image}`} className="object-cover w-full h-full" alt="" />
                          : <Package className="w-6 h-6 text-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{product?.productName}</p>
                        {variant && <p className="text-xs text-indigo-500">{variant.size} / {variant.color}</p>}
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatCurrency(parseFloat(item.subtotal))}</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment Method */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" /> Select Payment Method</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Cash */}
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all
                      ${paymentMethod === 'Cash' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentMethod === 'Cash' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                      <Banknote className={`w-7 h-7 ${paymentMethod === 'Cash' ? 'text-indigo-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">Cash Payment</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay when delivered</p>
                    </div>
                    {paymentMethod === 'Cash' && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-black">✓</span></div>}
                  </button>

                  {/* UPI */}
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all
                      ${paymentMethod === 'UPI' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentMethod === 'UPI' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                      <Smartphone className={`w-7 h-7 ${paymentMethod === 'UPI' ? 'text-indigo-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">UPI Payment</p>
                      <p className="text-xs text-gray-500 mt-0.5">Instant via QR code</p>
                    </div>
                    {paymentMethod === 'UPI' && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-black">✓</span></div>}
                  </button>
                </div>

                {paymentMethod === 'UPI' && (
                  <UpiPayment total={total} onConfirm={(utr) => placeOrder(utr)} loading={submitting} />
                )}
                {paymentMethod === 'Cash' && (
                  <CashPayment onConfirm={() => placeOrder()} loading={submitting} />
                )}

                {!paymentMethod && (
                  <p className="text-center text-gray-400 text-sm py-4">Select a payment method above to continue</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.slice(0, 3).map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-[150px]">{item.Product?.productName}{item.variant?.size ? ` (${item.variant.size})` : ''} ×{item.quantity}</span>
                  <span>{formatCurrency(parseFloat(item.subtotal))}</span>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span><span className="font-semibold">{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between text-gray-800 text-base font-black border-t pt-2 mt-2">
                <span>Grand Total</span>
                <span className="text-indigo-700 text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
