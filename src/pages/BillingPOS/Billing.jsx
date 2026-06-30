import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/product.service';
import { customerService } from '../../services/customer.service';
import { orderService } from '../../services/order.service';
import { invoiceService } from '../../services/invoice.service';
import { paymentService } from '../../services/payment.service';
import { warehouseService } from '../../services/warehouse.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { Search, Plus, Minus, Trash2, PauseCircle, PlayCircle, Loader2, UserPlus, CreditCard, Banknote, Landmark, Smartphone, ShoppingCart, ArrowRight } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const Billing = () => {
  const { 
    cart, addToCart, removeFromCart, updateQuantity, clearCart, 
    discount, setDiscount, gstRate, setGstRate,
    subtotal, gstAmount, grandTotal, 
    holdBills, holdCurrentBill, resumeBill, removeHoldBill 
  } = useCart();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [holdReference, setHoldReference] = useState('');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes, whRes] = await Promise.all([
        productService.getProducts(),
        customerService.getCustomers().catch(() => ({ data: { data: [] } })), // Graceful fallback
        warehouseService.getWarehouses().catch(() => ({ data: { data: [] } }))
      ]);
      setProducts(prodRes.data.data || []);
      setCustomers(custRes.data.data || []);
      setWarehouses(whRes.data.data || []);
    } catch (error) {
      console.error('Failed to load POS data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 4000); };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return showError('Cart is empty');
    if (warehouses.length === 0) return showError('No warehouse found in system to deduct stock from');
    
    setCheckoutLoading(true);
    try {
      // 1. Create Order
      const defaultWarehouseId = warehouses[0].id;
      const orderPayload = {
        customerId: selectedCustomer || undefined,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          retailPrice: item.retailPrice,
          warehouseId: defaultWarehouseId
        }))
      };
      
      const orderRes = await orderService.createOrder(orderPayload);
      const orderId = orderRes.data.data.id;

      // 2. Generate Invoice
      const invRes = await invoiceService.generateInvoice({
        referenceId: orderId,
        type: 'CUSTOMER'
      });
      const invoiceId = invRes.data.data.id;

      // 3. Record Payment
      await paymentService.recordPayment({
        invoiceId,
        paymentMethod,
        amount: grandTotal
      });

      showSuccess('Checkout successful! Invoice generated.');
      clearCart();
      setIsCheckoutModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleHoldBill = () => {
    if (!holdReference) return;
    holdCurrentBill(holdReference);
    setHoldReference('');
    setIsHoldModalOpen(false);
    showSuccess('Bill put on hold');
  };

  const filteredProducts = products.filter(p => 
    (p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.sku?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    p.stock > 0
  );

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* LEFT PANE: Product Grid */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Product Catalog</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" placeholder="Search by name or SKU..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const imgUrl = product.image ? `http://localhost:5000${product.image}` : null;
                return (
                  <div 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    className="border rounded-lg p-3 cursor-pointer hover:border-primary hover:shadow-md transition-all flex flex-col items-center text-center group bg-white"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <span className="text-gray-400 text-xs font-medium">No Image</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{product.productName}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    <div className="mt-2 w-full flex justify-between items-center">
                      <p className="font-bold text-primary">{formatCurrency(product.retailPrice)}</p>
                      <span className="text-[10px] bg-green-50 text-success px-2 py-0.5 rounded-full font-medium">Qty: {product.stock}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Cart & Checkout */}
      <div className="w-full md:w-[400px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-900 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center"><ShoppingCart className="w-5 h-5 mr-2" /> Current Order</h2>
          <button onClick={() => setIsHoldModalOpen(true)} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg flex items-center transition-colors">
            <PauseCircle className="w-4 h-4 mr-1" /> Hold
          </button>
        </div>

        {/* Alerts in Cart */}
        {successMsg && <div className="p-3 bg-green-50 text-success text-sm font-medium border-b">{successMsg}</div>}
        {errorMsg && <div className="p-3 bg-red-50 text-danger text-sm font-medium border-b">{errorMsg}</div>}

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div className="flex-1 pr-3">
                    <p className="font-medium text-gray-800 text-sm leading-tight">{item.productName}</p>
                    <p className="text-primary font-bold text-sm mt-1">{formatCurrency(item.retailPrice)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 text-sm font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-danger mt-2 text-xs hover:underline flex items-center">
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount:</span>
              <input type="number" min="0" max={subtotal} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 px-2 py-1 border rounded text-right focus:outline-none focus:border-primary" />
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>GST ({gstRate}%):</span>
              <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className="border rounded bg-transparent px-1">
                <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option>
              </select>
            </div>
            <div className="flex justify-between text-gray-600"><span>GST Amount:</span><span className="font-bold">{formatCurrency(gstAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
              <span>Grand Total:</span><span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={clearCart} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors">Clear</button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="flex-[2] py-3 bg-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Checkout <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Hold Bills Overlay Indicator */}
      {holdBills.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-4 w-72">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm"><PauseCircle className="w-4 h-4 mr-2 text-warning" /> On Hold Bills ({holdBills.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holdBills.map(bill => (
                <div key={bill.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                  <span className="font-medium truncate flex-1">{bill.reference}</span>
                  <button onClick={() => resumeBill(bill.id)} className="text-primary hover:bg-indigo-50 p-1 rounded"><PlayCircle className="w-4 h-4" /></button>
                  <button onClick={() => removeHoldBill(bill.id)} className="text-danger hover:bg-red-50 p-1 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout & Payment Modal */}
      <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Checkout & Payment">
        <form onSubmit={handleCheckout} className="space-y-6">
          <div className="bg-indigo-50 text-indigo-900 p-6 rounded-xl text-center border border-indigo-100">
            <p className="text-sm font-medium mb-1">Total Amount Due</p>
            <p className="text-4xl font-black">{formatCurrency(grandTotal)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><UserPlus className="w-4 h-4 mr-1" /> Link Customer (Optional)</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">Walk-in Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name || c.customerName} - {c.phone}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Cash', icon: Banknote },
                { id: 'UPI', icon: Smartphone },
                { id: 'Card', icon: CreditCard },
                { id: 'Bank Transfer', icon: Landmark }
              ].map(method => (
                <div 
                  key={method.id} 
                  onClick={() => setPaymentMethod(method.id)}
                  className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${paymentMethod === method.id ? 'border-primary bg-indigo-50 text-primary shadow-sm ring-1 ring-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <method.icon className="w-6 h-6 mb-2" />
                  <span className="font-bold text-sm">{method.id}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={checkoutLoading} className="w-full py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center">
            {checkoutLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : 'Confirm Payment & Print'}
          </button>
        </form>
      </Modal>

      {/* Hold Bill Modal */}
      <Modal isOpen={isHoldModalOpen} onClose={() => setIsHoldModalOpen(false)} title="Hold Current Bill">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Provide a reference name to easily resume this bill later (e.g. Customer Name, Table Number).</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Name</label>
            <input type="text" autoFocus value={holdReference} onChange={(e) => setHoldReference(e.target.value)} placeholder="e.g. John Doe - Waiting" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsHoldModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700">Cancel</button>
            <button onClick={handleHoldBill} disabled={!holdReference} className="px-4 py-2 bg-warning text-white rounded-lg font-medium disabled:opacity-50">Hold Bill</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Billing;
