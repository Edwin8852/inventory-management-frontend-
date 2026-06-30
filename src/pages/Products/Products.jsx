import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Filter, ChevronDown, ChevronRight, Package, Tag } from 'lucide-react';
import { productService } from '../../services/product.service';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { API_BASE_URL } from '../../utils/constants';

// ── Variant Row for inline display ──────────────────────────────────────────
const VariantBadge = ({ v }) => {
  const storeOk = v.storeStock > 0;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 text-xs mr-1 mb-1 bg-white">
      <span className="font-semibold text-gray-700">{v.size}/{v.color}</span>
      <span className={`font-bold ${storeOk ? 'text-green-600' : 'text-red-500'}`}>
        S:{v.storeStock}
      </span>
      <span className="text-indigo-600 font-bold">W:{v.warehouseStock}</span>
    </span>
  );
};

// ── Variant form builder ─────────────────────────────────────────────────────
const emptyVariant = () => ({ size: '', color: '', warehouseStock: 0, storeStock: 0, sku: '' });

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Product form
  const initialFormState = {
    productName: '', sku: '', category: '', brand: '',
    wholesalePrice: '', retailPrice: '', costPrice: '',
    gstPercentage: '18', minOrderQuantity: '1',
    description: '', status: 'Active', image: null
  };
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);

  // Variants form
  const [variants, setVariants] = useState([emptyVariant()]);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      setProducts(res.data.data || []);
    } catch { showError('Failed to fetch products.'); }
    finally { setLoading(false); }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 5000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  // ── Form open ───────────────────────────────────────────────────────────────
  const handleOpenForm = (product = null) => {
    setImageFile(null);
    setError(null);
    if (product) {
      setCurrentProduct(product);
      setFormData({
        productName: product.productName || '',
        sku: product.sku || '',
        category: product.category || '',
        brand: product.brand || '',
        wholesalePrice: product.wholesalePrice ?? '',
        retailPrice: product.retailPrice ?? '',
        costPrice: product.costPrice ?? '',
        gstPercentage: product.gstPercentage ?? '18',
        minOrderQuantity: product.minOrderQuantity ?? '1',
        description: product.description || '',
        status: product.status || 'Active',
        image: product.image || null,
      });
      // Populate existing variants
      setVariants(product.variants?.length > 0
        ? product.variants.map(v => ({
            id: v.id,
            size: v.size || '',
            color: v.color || '',
            warehouseStock: v.warehouseStock ?? 0,
            storeStock: v.storeStock ?? 0,
            sku: v.sku || '',
          }))
        : [emptyVariant()]);
    } else {
      setCurrentProduct(null);
      setFormData(initialFormState);
      setVariants([emptyVariant()]);
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => { setIsFormModalOpen(false); setCurrentProduct(null); };

  // ── Variant handlers ─────────────────────────────────────────────────────────
  const addVariant = () => setVariants(v => [...v, emptyVariant()]);
  const removeVariant = (idx) => setVariants(v => v.filter((_, i) => i !== idx));
  const updateVariant = (idx, field, val) =>
    setVariants(v => v.map((row, i) => i === idx ? { ...row, [field]: val } : row));

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    // Validate at least one variant with size+color
    const validVariants = variants.filter(v => v.size.trim() && v.color.trim());
    if (validVariants.length === 0) {
      setError('Please add at least one variant with size and color.');
      setFormLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (k !== 'image') payload.append(k, v ?? ''); });
      if (imageFile) payload.append('image', imageFile);

      let productId = currentProduct?.id;
      if (currentProduct) {
        await productService.updateProduct(productId, payload);
      } else {
        const res = await productService.createProduct(payload);
        productId = res.data.data?.id;
      }

      // Save/update variants
      for (const variant of validVariants) {
        const vData = {
          productId,
          size: variant.size,
          color: variant.color,
          warehouseStock: Number(variant.warehouseStock) || 0,
          storeStock: Number(variant.storeStock) || 0,
          sku: variant.sku || `${formData.sku}-${variant.size}-${variant.color}`.toUpperCase(),
        };
        if (variant.id) {
          await api.put(`/products/variants/${variant.id}`, vData);
        } else {
          await api.post(`/products/${productId}/variants`, vData);
        }
      }

      showSuccess(currentProduct ? 'Product updated successfully.' : 'Product created with variants!');
      handleCloseForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally { setFormLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleOpenDelete = (product) => { setCurrentProduct(product); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    setFormLoading(true);
    try {
      await productService.deleteProduct(currentProduct.id);
      showSuccess('Product deleted.');
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch { showError('Failed to delete product.'); }
    finally { setFormLoading(false); }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  const getTotalStock = (product) =>
    (product.variants || []).reduce((sum, v) => sum + (v.storeStock || 0), 0);

  const getStockBadge = (total) => {
    if (total <= 0) return 'bg-red-100 text-red-700';
    if (total <= 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto w-full">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Management</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Products with size & color variants — warehouse and store stock tracked separately</p>
        </div>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 font-medium rounded-xl">{successMsg}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl">{error}</div>}

      {/* Stats & Actions Row */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
        <div className="flex flex-wrap items-center gap-8 w-full lg:w-auto">
          {/* Stat 1 */}
          <div className="flex-1 min-w-[120px] border-l-[3px] border-indigo-500 pl-4">
            <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Products</p>
            <p className="text-3xl font-black text-gray-900">{products.length}</p>
          </div>
          {/* Stat 2 */}
          <div className="flex-1 min-w-[120px] border-l-[3px] border-green-400 pl-4">
            <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">High Stock Items</p>
            <p className="text-3xl font-black text-gray-900">{products.filter(p => getTotalStock(p) > 50).length}</p>
          </div>
          {/* Stat 3 */}
          <div className="flex-1 min-w-[120px] border-l-[3px] border-orange-400 pl-4">
            <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-3xl font-black text-gray-900">{products.filter(p => getTotalStock(p) <= 10 && getTotalStock(p) > 0).length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name, SKU..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-sm font-medium" />
          </div>
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-700 shadow-sm cursor-pointer">
              <option value="">Filter</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <button onClick={() => handleOpenForm()} className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all whitespace-nowrap">
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Headers for Card List */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 bg-transparent text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-3">
        <div className="col-span-1 text-center">Image</div>
        <div className="col-span-3">SKU / Product</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1 text-right">Wholesale</div>
        <div className="col-span-1 text-right">Retail</div>
        <div className="col-span-1 text-center">GST% & MOQ</div>
        <div className="col-span-2 text-center">Variants & Stock</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-auto space-y-3 pb-8">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
            <p className="font-bold text-gray-600">No products found</p>
          </div>
        ) : filteredProducts.map(product => {
          const total = getTotalStock(product);
          const baseUrl = API_BASE_URL.replace('/api', '');
          const imgUrl = product.image ? `${baseUrl}${product.image}` : null;
          const isExpanded = expandedRows.has(product.id);
          
          const getCategoryStyle = (cat) => {
            if (!cat) return 'bg-gray-100 text-gray-700';
            const lowerCat = cat.toLowerCase();
            if (lowerCat.includes('men')) return 'bg-blue-50 text-blue-700 border-blue-100';
            if (lowerCat.includes('women')) return 'bg-pink-50 text-pink-700 border-pink-100';
            if (lowerCat.includes('footwear')) return 'bg-orange-50 text-orange-700 border-orange-100';
            return 'bg-purple-50 text-purple-700 border-purple-100';
          };

          return (
            <div key={product.id} className="bg-white rounded-[20px] shadow-sm hover:shadow-md border border-gray-100 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-3 sm:p-4">
                {/* Image */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-[52px] h-[52px] rounded-full border border-gray-200 shadow-sm overflow-hidden bg-white flex items-center justify-center shrink-0">
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>

                {/* SKU & Product Name */}
                <div className="col-span-3">
                  <p className="font-bold text-gray-900 text-[15px] leading-tight mb-0.5">{product.productName}</p>
                  <p className="text-xs font-mono font-medium text-gray-400">{product.sku}</p>
                </div>

                {/* Category Pill */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getCategoryStyle(product.category)}`}>
                    {product.category || 'Uncategorized'}
                  </span>
                </div>

                {/* Prices */}
                <div className="col-span-1 text-right flex flex-col justify-center">
                  <p className="font-black text-gray-800 text-sm">{formatCurrency(product.wholesalePrice)}</p>
                  <p className="text-[10px] font-bold text-gray-400 line-through">{formatCurrency((product.wholesalePrice || 0) * 1.1)}</p>
                </div>
                <div className="col-span-1 text-right flex flex-col justify-center">
                  <p className="font-black text-gray-900 text-[15px]">{formatCurrency(product.retailPrice)}</p>
                  <p className="text-[10px] font-bold text-gray-400 line-through">{formatCurrency((product.retailPrice || 0) * 1.2)}</p>
                </div>

                {/* GST & MOQ */}
                <div className="col-span-1 text-center">
                  <p className="text-xs font-bold text-gray-600">{product.gstPercentage ?? 18}%</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">{product.minOrderQuantity ?? 1} pcs</p>
                </div>

                {/* Variants & Stock Badges */}
                <div className="col-span-2 flex flex-wrap lg:flex-nowrap items-center justify-center gap-3">
                  <button onClick={() => toggleRow(product.id)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center cursor-pointer min-w-fit">
                    {product.variants?.length ?? 0} vars
                    <ChevronDown className={`w-3.5 h-3.5 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold min-w-fit ${getStockBadge(total)}`}>
                    {total} units
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1 sm:gap-2 pr-1">
                  <button className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"><div className="w-1 h-1 bg-current rounded-full mx-auto mb-0.5"></div><div className="w-1 h-1 bg-current rounded-full mx-auto mb-0.5"></div><div className="w-1 h-1 bg-current rounded-full mx-auto"></div></button>
                  <button onClick={() => handleOpenForm(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleOpenDelete(product)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Expanded Variants Panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 rounded-b-[20px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(product.variants || []).map(v => (
                      <div key={v.id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-mono font-bold text-gray-500">{v.sku}</span>
                          </div>
                          <span className="text-xs font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">{v.size} / {v.color}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="text-[11px] font-bold text-gray-400 flex flex-col">
                            <span className="uppercase tracking-wider">Store Stock</span>
                            <span className={`text-sm mt-0.5 ${v.storeStock > 0 ? 'text-green-600' : 'text-red-500'}`}>{v.storeStock} units</span>
                          </div>
                          <div className="text-[11px] font-bold text-gray-400 flex flex-col text-right">
                            <span className="uppercase tracking-wider">Warehouse</span>
                            <span className="text-sm mt-0.5 text-indigo-600">{v.warehouseStock} units</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!product.variants || product.variants.length === 0) && (
                      <div className="text-sm text-gray-500 italic p-3 bg-white rounded-xl border border-dashed border-gray-300 w-full col-span-full">No variants configured for this product.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title={currentProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSaveProduct} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-danger text-sm">{error}</div>}

          {/* ── Product Core Fields ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Product Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" required value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pricing & GST</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                <input type="number" min="0" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price *</label>
                <input type="number" required min="0" step="0.01" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price *</label>
                <input type="number" required min="0" step="0.01" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                <input type="number" min="0" max="100" value={formData.gstPercentage} onChange={e => setFormData({...formData, gstPercentage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty (MOQ)</label>
                <input type="number" min="1" value={formData.minOrderQuantity} onChange={e => setFormData({...formData, minOrderQuantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* ── Variants ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Variants (Size / Color)</p>
              <button type="button" onClick={addVariant} className="text-xs px-3 py-1 bg-indigo-50 text-primary rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Size *</label>
                    <input type="text" required value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value.toUpperCase())}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none font-mono" placeholder="S" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Color *</label>
                    <input type="text" required value={v.color} onChange={e => updateVariant(idx, 'color', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Red" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Variant SKU</label>
                    <input type="text" value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value.toUpperCase())}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none font-mono" placeholder="AUTO" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">WH Stock</label>
                    <input type="number" min="0" value={v.warehouseStock} onChange={e => updateVariant(idx, 'warehouseStock', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Store Stock</label>
                    <input type="number" min="0" value={v.storeStock} onChange={e => updateVariant(idx, 'storeStock', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)} className="p-1.5 text-danger hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
            <button type="button" onClick={handleCloseForm} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
            <button type="submit" disabled={formLoading} className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center">
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentProduct ? 'Update Product' : 'Save Product & Variants'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Product?</h3>
          <p className="text-gray-500 mb-6">
            Delete <span className="font-bold text-gray-800">{currentProduct?.productName}</span> and all its variants? This cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
            <button onClick={confirmDelete} disabled={formLoading} className="px-6 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-600 flex items-center">
              {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
