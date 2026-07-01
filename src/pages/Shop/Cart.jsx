import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Package, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { cartService } from '../../services/cart.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../utils/constants';

const baseUrl = API_BASE_URL.replace('/api', '');

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSupplier = user?.role === 'SUPPLIER';

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.data);
    } catch { console.error('Failed to fetch cart'); }
    finally { setLoading(false); }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove(item.id);
    setUpdating(item.id);
    try {
      const res = await cartService.updateCartItem(item.id, { quantity: newQty });
      setCart(res.data.data);
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const handleRemove = async (itemId) => {
    setUpdating(itemId);
    try {
      const res = await cartService.removeFromCart(itemId);
      setCart(res.data.data);
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.subtotal || 0), 0);
  const gstRate = 0.18;
  const gst = subtotal * gstRate;
  const total = subtotal + gst;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-extrabold">Your Cart</h1>
            <p className="text-sm opacity-80">{items.length} item{items.length !== 1 ? 's' : ''} ready for checkout</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Browse the catalog and add items to get started.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => {
              const product = item.Product;
              const variant = item.variant;
              const imgUrl = product?.image ? `${baseUrl}${product.image}` : null;

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center relative">
                  {/* Image */}
                  <div className="w-full sm:w-20 h-32 sm:h-20 bg-gray-50 rounded-xl border overflow-hidden flex items-center justify-center shrink-0">
                    {imgUrl
                      ? <img src={imgUrl} alt={product?.productName} className="object-cover w-full h-full" />
                      : <Package className="w-8 h-8 text-gray-300" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{product?.productName || 'Unknown Product'}</p>
                    {variant && (
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">{variant.size} / {variant.color}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(item.price)} each</p>
                  </div>

                  {/* Actions & Info row on mobile */}
                  <div className="flex items-center justify-between sm:contents w-full">
                    {/* Quantity */}
                    <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-800">
                      {updating === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-black text-indigo-700 text-lg">{formatCurrency(parseFloat(item.subtotal))}</p>
                  </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updating === item.id}
                      className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0 p-2 sm:p-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => navigate('/shop')}
              className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1 pt-2"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold">{formatCurrency(gst)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-gray-800 text-base font-black">
                  <span>Grand Total</span>
                  <span className="text-indigo-700 text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
