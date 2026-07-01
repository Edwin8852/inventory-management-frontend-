import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Loader2, Star, AlertCircle,
  Tag, Package, ChevronDown, ChevronRight, X, Plus, Check
} from 'lucide-react';
import { productService } from '../../services/product.service';
import { cartService } from '../../services/cart.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../utils/constants';

const baseUrl = API_BASE_URL.replace('/api', '');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const groupByCategory = (products) => {
  return products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
};

const CustomerProductCard = ({ product, onAddToCart, adding }) => {
  const totalStore = product.variants?.reduce((s, v) => s + (v.storeStock || 0), 0) || 0;
  const inStock = totalStore > 0;
  const imgUrl = product.image ? `${baseUrl}${product.image}` : null;
  const brandName = product.brand ? product.brand.toUpperCase() : 'BRAND';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group overflow-visible relative pb-5">
      <div className="h-56 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-3xl relative flex items-center justify-center p-6 mx-2 mt-2 overflow-hidden shadow-inner">
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded tracking-wider shadow-sm z-10">
          {brandName}
        </div>
        
        <div className={`absolute top-4 right-4 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm z-10 ${inStock ? 'bg-emerald-600/90' : 'bg-red-500/90'}`}>
          {inStock ? `IN STOCK (${totalStore})` : 'OUT OF STOCK'}
        </div>

        {imgUrl
          ? <img src={imgUrl} alt={product.productName} className="object-contain w-full h-full drop-shadow-2xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 z-0" />
          : <Package className="w-16 h-16 text-gray-500/50" />
        }
      </div>

      <div className="px-5 pt-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-[17px] leading-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.productName}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {product.variants?.length > 0 ? (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">{product.variants.length} Sizes Available</span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400 border border-gray-100 px-2 py-0.5 rounded shadow-sm">Standard</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between relative">
          <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">PRICE</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(product.retailPrice)}</p>
          </div>
          
          <button
            disabled={!inStock || adding === product.id}
            onClick={() => onAddToCart(product)}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90
              ${inStock ? 'bg-gray-900 text-white hover:bg-indigo-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {adding === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const SupplierProductCard = ({ product, onAddToCart, adding }) => {
  const totalWH = product.variants?.reduce((s, v) => s + (v.warehouseStock || 0), 0) || 0;
  const inStock = totalWH > 0;
  const imgUrl = product.image ? `${baseUrl}${product.image}` : null;
  const brandName = product.brand ? product.brand.toUpperCase() : 'SUPPLIER';
  const moq = product.minOrderQuantity || 1;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group overflow-visible relative pb-5">
      <div className="h-56 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl relative flex items-center justify-center p-6 mx-2 mt-2 overflow-hidden shadow-inner">
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded tracking-wider shadow-sm z-10">
          {brandName}
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-10">
          <div className={`text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm ${inStock ? 'bg-emerald-600/90' : 'bg-red-500/90'}`}>
            {inStock ? `WH STOCK (${totalWH})` : 'OUT OF STOCK'}
          </div>
          <div className="bg-yellow-500/90 backdrop-blur-md text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            MOQ: {moq}
          </div>
        </div>

        {imgUrl
          ? <img src={imgUrl} alt={product.productName} className="object-contain w-full h-full drop-shadow-2xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 z-0" />
          : <Package className="w-16 h-16 text-gray-500/50" />
        }
      </div>

      <div className="px-5 pt-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-[17px] leading-tight mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.productName}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {product.variants?.length > 0 ? (
            <span className="text-xs font-semibold text-gray-500 bg-purple-50 px-2.5 py-1 rounded-md text-purple-700">{product.variants.length} Sizes Available</span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400 border border-gray-100 px-2 py-0.5 rounded shadow-sm">Standard</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between relative">
          <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">WHOLESALE</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(product.wholesalePrice)}</p>
          </div>
          
          <button
            disabled={!inStock || adding === product.id}
            onClick={() => onAddToCart(product)}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90
              ${inStock ? 'bg-gray-900 text-white hover:bg-purple-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {adding === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add To Cart Modal (Multi-Size + Warehouse) ─────────────────────────────

const AddToCartModal = ({ product, isSupplier, onClose, onConfirm }) => {
  const [selections, setSelections] = useState({});
  const [warehouseId, setWareHouseId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const moq = product?.minOrderQuantity || 1;

  useEffect(() => {
    if (isSupplier) {
      import('../../services/warehouse.service').then(m => {
        m.warehouseService.getWarehouses().then(r => setWarehouses(r.data?.data || [])).catch(() => {});
      });
    }
  }, [isSupplier]);

  const handleSizeClick = (v) => {
    const stock = isSupplier ? v.warehouseStock : v.storeStock;
    if (stock <= 0) return;
    setSelections(prev => {
      if (prev[v.id]) return prev;
      return { ...prev, [v.id]: 1 }; // start at 1 or min order? For multi-size, min order is across total, so start at 1
    });
  };

  const updateQuantity = (vId, delta) => {
    setSelections(prev => {
      const current = prev[vId] || 0;
      const next = current + delta;
      const variant = product.variants.find(v => v.id === vId);
      const stock = isSupplier ? variant.warehouseStock : variant.storeStock;
      
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[vId];
        return copy;
      }
      if (next > stock) return prev;
      return { ...prev, [vId]: next };
    });
  };

  // If no variants exist, use standard product qty
  const [standardQty, setStandardQty] = useState(isSupplier ? moq : 1);
  const totalStore = product.variants?.reduce((s, v) => s + (v.storeStock || 0), 0) || 0;
  const totalWH = product.variants?.reduce((s, v) => s + (v.warehouseStock || 0), 0) || 0;
  
  const hasVariants = product.variants?.length > 0;
  const totalUnits = hasVariants ? Object.values(selections).reduce((s, q) => s + q, 0) : standardQty;
  const price = isSupplier ? product.wholesalePrice : product.retailPrice;
  const subtotal = totalUnits * price;
  const meetsMOQ = isSupplier ? totalUnits >= moq : true;

  const handleAdd = async () => {
    if (isSupplier && !warehouseId) {
      alert("Please select a delivery warehouse.");
      return;
    }

    setLoading(true);
    try {
      if (hasVariants) {
        const payloadArray = Object.entries(selections).map(([vId, qty]) => ({
          productId: product.id,
          variantId: vId,
          quantity: qty,
          price: price,
          warehouseId: warehouseId || null
        }));
        await onConfirm(payloadArray);
      } else {
        await onConfirm([{
          productId: product.id,
          variantId: null,
          quantity: standardQty,
          price: price,
          warehouseId: warehouseId || null
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Add to Cart
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
          {/* Product Header */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {product.image ? <img src={`${baseUrl}${product.image}`} className="object-cover w-full h-full" alt="" /> : <Package className="w-8 h-8 text-gray-300" />}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{product.productName}</p>
              <div className="flex justify-between items-end">
                <p className="text-indigo-700 font-black text-lg">{formatCurrency(price)}</p>
                {isSupplier && <p className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">MOQ: {moq}</p>}
              </div>
            </div>
          </div>

          {/* Warehouse Selection */}
          {isSupplier && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                Deliver to Warehouse <span className="text-red-500">*</span>
              </label>
              <select value={warehouseId} onChange={e => setWareHouseId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm transition-all font-medium text-gray-700 bg-white">
                <option value="">— Select Warehouse —</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
              </select>
            </div>
          )}

          {/* Size Variants Configuration */}
          {hasVariants ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => {
                    const stock = isSupplier ? v.warehouseStock : v.storeStock;
                    const isSelected = !!selections[v.id];
                    const isOutOfStock = stock <= 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSizeClick(v)}
                        disabled={isOutOfStock}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all border
                          ${isSelected 
                            ? (isSupplier ? 'bg-purple-900 text-white border-purple-900 ring-2 ring-purple-900/20' : 'bg-gray-900 text-white border-gray-900 ring-2 ring-gray-900/20') 
                            : isOutOfStock 
                              ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}
                      >
                        {v.size || 'STD'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {Object.keys(selections).length > 0 && (
                <div className={`rounded-xl p-4 border space-y-3 shadow-inner ${isSupplier ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-bold ${isSupplier ? 'text-purple-900' : 'text-gray-700'}`}>
                    Selected Sizes Configuration:
                  </p>
                  {Object.entries(selections).map(([vId, qty]) => {
                    const variant = product.variants.find(v => v.id === vId);
                    const stock = isSupplier ? variant.warehouseStock : variant.storeStock;
                    return (
                      <div key={vId} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded ${isSupplier ? 'bg-purple-900 text-white' : 'bg-gray-900 text-white'}`}>
                            {variant?.size}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">Max {stock}</span>
                        </div>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <button onClick={() => updateQuantity(vId, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-black transition-colors">−</button>
                          <span className="text-xs font-bold w-8 text-center">{qty}</span>
                          <button onClick={() => updateQuantity(vId, 1)} disabled={qty >= stock} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-black transition-colors disabled:opacity-30">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
              <div className="flex items-center bg-white border border-gray-300 rounded-xl w-32 overflow-hidden shadow-sm">
                <button type="button" onClick={() => setStandardQty(q => Math.max(isSupplier ? moq : 1, q - 1))}
                  className="w-10 h-10 bg-gray-50 font-bold text-gray-600 hover:bg-gray-200 border-r border-gray-300 transition-colors">−</button>
                <input type="number" value={standardQty} onChange={e => setStandardQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-10 text-center font-bold text-gray-900 outline-none text-sm" />
                <button type="button" onClick={() => setStandardQty(q => q + 1)}
                  className="w-10 h-10 bg-gray-50 font-bold text-gray-600 hover:bg-gray-200 border-l border-gray-300 transition-colors">+</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 mt-2 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-semibold text-gray-500">Total Units: <span className="text-gray-900 font-black">{totalUnits}</span></span>
            <span className="text-sm font-semibold text-gray-500">Subtotal: <span className="text-indigo-700 font-black">{formatCurrency(subtotal)}</span></span>
          </div>
          
          {totalUnits > 0 && !meetsMOQ && (
            <p className="text-[11px] text-red-600 font-bold bg-red-50 p-2 rounded-lg text-center border border-red-100">
              Please add {moq - totalUnits} more units to meet the MOQ of {moq}.
            </p>
          )}

          <button onClick={handleAdd} disabled={loading || totalUnits === 0 || !meetsMOQ || (isSupplier && !warehouseId)}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm
              ${totalUnits > 0 && meetsMOQ && (!isSupplier || warehouseId) ? (isSupplier ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Catalog Component ───────────────────────────────────────────────────

const Catalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSupplier = user?.role === 'SUPPLIER';

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [collapsedCats, setCollapsedCats] = useState(new Set());
  const [addingProduct, setAddingProduct] = useState(null);
  const [adding, setAdding] = useState(null); // id being animated
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      setProducts(res.data.data || []);
    } catch { console.error('Failed to fetch products'); }
    finally { setLoading(false); }
  };

  const fetchCartCount = async () => {
    try {
      const res = await cartService.getCart();
      setCartCount(res.data.data?.items?.length || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const handleAddToCartClick = (product) => {
    setAddingProduct(product);
  };

  const handleConfirmAdd = async (payloadArray) => {
    if (!payloadArray || payloadArray.length === 0) return;
    const productId = payloadArray[0].productId;
    setAdding(productId);

    try {
      // Add items sequentially
      for (const item of payloadArray) {
        await cartService.addToCart(item);
      }
      setAddingProduct(null);
      await fetchCartCount();
      showToast('Added to cart!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAdding(null);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleCategory = (cat) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filtered = products.filter(p => {
    const active = p.status === 'Active' || p.status === 'ACTIVE';
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.productName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    return active && matchSearch;
  });

  const categories = ['All', ...Object.keys(groupByCategory(filtered))];
  const displayed = activeCat === 'All' ? filtered : filtered.filter(p => (p.category || 'Uncategorized') === activeCat);
  const grouped = groupByCategory(displayed);

  return (
    <div className="h-full flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl font-semibold text-white transition-all
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div 
        className="mb-6 p-7 shadow-lg"
        style={{
          borderRadius: '16px',
          background: isSupplier 
            ? 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #7C3AED 100%)' 
            : 'linear-gradient(135deg, #4F46E5 0%, #db2777 100%)'
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
              <div 
                className="flex items-center justify-center p-2"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  borderRadius: '12px',
                }}
              >
                {isSupplier ? <Package className="w-7 h-7 text-white" /> : <ShoppingCart className="w-7 h-7 text-white" />}
              </div>
              {isSupplier ? 'Wholesale Catalog' : 'Shop Catalog'}
            </h1>
            <p className="text-gray-200 text-sm font-medium ml-1">
              {isSupplier ? 'Browse products and add to cart for bulk ordering.' : 'Discover our collection. Add items to cart and checkout.'}
            </p>
          </div>
          {/* Cart Button */}
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 font-semibold transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0px 8px 20px rgba(0,0,0,0.15)' 
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div 
          className="relative max-w-lg mt-6"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px'
          }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white opacity-90" />
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-transparent text-white font-medium focus:outline-none placeholder:text-white/75"
            style={{ borderRadius: '14px' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tab Bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
              ${activeCat === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}
          >
            <Tag className="w-3.5 h-3.5" />{cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center mt-16 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-3 text-gray-200" />
            <p className="font-semibold">No products found.</p>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {Object.entries(grouped).map(([cat, catProducts]) => {
              const collapsed = collapsedCats.has(cat);
              return (
                <div key={cat}>
                  <button onClick={() => toggleCategory(cat)} className="flex items-center gap-2 mb-4 group w-full text-left">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      {collapsed ? <ChevronRight className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">{cat}</h2>
                    <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{catProducts.length} products</span>
                    <div className="flex-1 h-px bg-gray-100 ml-2" />
                  </button>

                  {!collapsed && (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {catProducts.map(product => (
                        isSupplier
                          ? <SupplierProductCard key={product.id} product={product} onAddToCart={handleAddToCartClick} adding={adding} />
                          : <CustomerProductCard key={product.id} product={product} onAddToCart={handleAddToCartClick} adding={adding} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {addingProduct && (
        <AddToCartModal
          product={addingProduct}
          isSupplier={isSupplier}
          onClose={() => setAddingProduct(null)}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
};

export default Catalog;
