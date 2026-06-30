import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { supplierService } from '../../services/supplier.service';
import { warehouseService } from '../../services/warehouse.service';
import { productService } from '../../services/product.service';
import { purchaseService } from '../../services/purchase.service';
import { useAuth } from '../../hooks/useAuth';

const CreatePurchaseModal = ({ isOpen, onClose, onPurchaseCreated }) => {
  const { user } = useAuth();
  const isSupplier = user?.role === 'SUPPLIER';
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    warehouseId: '',
    items: [{ productId: '', variantId: '', quantity: 1, wholesalePrice: 0, minOrderQuantity: 1 }]
  });

  useEffect(() => {
    if (isOpen) {
      fetchFormData();
      setFormData({
        supplierId: '',
        warehouseId: '',
        items: [{ productId: '', variantId: '', quantity: 1, wholesalePrice: 0, minOrderQuantity: 1 }]
      });
      setError(null);
    }
  }, [isOpen]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [suppRes, wareRes, prodRes] = await Promise.all([
        supplierService.getSuppliers(),
        warehouseService.getWarehouses(),
        productService.getProducts()
      ]);
      setSuppliers(suppRes.data?.data || []);
      setWarehouses(wareRes.data?.data || []);
      setProducts(prodRes.data?.data || []);
    } catch (err) {
      setError('Failed to fetch data for the form.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill price and reset variant if product changes
    if (field === 'productId') {
      const selectedProd = products.find(p => p.id === value);
      if (selectedProd) {
        newItems[index].wholesalePrice = selectedProd.wholesalePrice || 0;
        newItems[index].minOrderQuantity = selectedProd.minOrderQuantity || 1;
        newItems[index].quantity = selectedProd.minOrderQuantity || 1; // Default to MOQ
        newItems[index].variantId = '';
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', variantId: '', quantity: 1, wholesalePrice: 0, minOrderQuantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // For SUPPLIER role: backend auto-injects supplierId, so we only require warehouseId
      if (isSupplier) {
        if (!formData.warehouseId || formData.items.length === 0) {
          throw new Error('Please select a warehouse and add at least one item.');
        }
      } else {
        if (!formData.supplierId || !formData.warehouseId || formData.items.length === 0) {
          throw new Error('Please fill in all required fields and add at least one item.');
        }
      }
      
      // Frontend Validation for Variant and MOQ
      for (const item of formData.items) {
        if (!item.variantId) {
          throw new Error('Please select a variant for all products.');
        }
        if (Number(item.quantity) < Number(item.minOrderQuantity)) {
          const prod = products.find(p => p.id === item.productId);
          throw new Error(`Minimum Order Quantity for ${prod?.productName || 'product'} is ${item.minOrderQuantity} units.`);
        }
      }

      const processedData = {
        // Only include supplierId if ADMIN (backend ignores it for SUPPLIER anyway)
        ...(isSupplier ? {} : { supplierId: formData.supplierId }),
        warehouseId: formData.warehouseId,
        items: formData.items.map(i => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: Number(i.quantity),
          wholesalePrice: Number(i.wholesalePrice)
        }))
      };
      await purchaseService.createPurchase(processedData);
      onPurchaseCreated();
      onClose();
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to create Purchase Order.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.wholesalePrice)), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Purchase Order">
      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-danger text-sm rounded border border-red-100 flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0"/><span>{error}</span></div>}
          
          <div className={`grid gap-4 ${isSupplier ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Only Admin sees the Supplier picker — suppliers ARE the supplier */}
            {!isSupplier && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select required value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-primary focus:border-primary">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Warehouse *</label>
              <select required value={formData.warehouseId} onChange={(e) => setFormData({...formData, warehouseId: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-gray-800 border-b w-full pb-2">Order Items (Variants)</h4>
            </div>
            {formData.items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              const variants = selectedProduct?.variants || [];
              const isBelowMOQ = Number(item.quantity) < Number(item.minOrderQuantity);
              
              return (
                <div key={index} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex gap-2 items-start mb-2">
                    <div className="flex-1">
                      <select required value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.productName} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <select required disabled={!item.productId} value={item.variantId} onChange={(e) => handleItemChange(index, 'variantId', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                        <option value="">Select Variant</option>
                        {variants.map(v => <option key={v.id} value={v.id}>{v.size} - {v.color} ({v.sku})</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div className="w-1/3 relative">
                      <label className="block text-xs text-gray-500 mb-1">Quantity (MOQ: {item.minOrderQuantity})</label>
                      <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className={`w-full p-2 border rounded-lg text-sm ${isBelowMOQ ? 'border-red-500 bg-red-50' : ''}`} />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-xs text-gray-500 mb-1">Wholesale Price (₹)</label>
                      <input type="number" min="0" step="0.01" required value={item.wholesalePrice} onChange={(e) => handleItemChange(index, 'wholesalePrice', e.target.value)} placeholder="Price" className="w-full p-2 border rounded-lg text-sm bg-gray-100" readOnly />
                    </div>
                    <div className="w-1/3 flex justify-between items-end pb-1 pl-2">
                      <div className="text-sm font-semibold text-primary">₹{(Number(item.quantity) * Number(item.wholesalePrice)).toFixed(2)}</div>
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-danger hover:bg-red-50 rounded text-xs ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {isBelowMOQ && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3"/> Quantity must be at least {item.minOrderQuantity}
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={addItem} className="mt-2 text-sm text-primary font-medium hover:underline flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Add Another Item
            </button>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center mt-6">
            <span className="text-indigo-800 font-medium">Estimated Total</span>
            <span className="text-2xl font-black text-indigo-900">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg mr-2 hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-primary text-white rounded-lg flex items-center font-medium hover:bg-indigo-700 disabled:opacity-70">
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Order
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreatePurchaseModal;

