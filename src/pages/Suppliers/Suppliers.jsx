import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { supplierService } from '../../services/supplier.service';
import Modal from '../../components/ui/Modal';

const emptyForm = { name: '', email: '', companyName: '', contactPerson: '', gstNumber: '', panNumber: '', phone: '', address: '', billingAddress: '', dispatchAddress: '', bankName: '', accountNumber: '', ifscCode: '', paymentTerms: '', creditLimit: '', status: 'ACTIVE' };

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getSuppliers();
      setSuppliers(res.data.data);
    } catch { showError('Failed to fetch suppliers.'); }
    finally { setLoading(false); }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000); };

  const handleOpenForm = (supplier = null) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setFormData({
        name: supplier.user?.name || '',
        email: supplier.user?.email || '',
        companyName: supplier.companyName || '',
        contactPerson: supplier.contactPerson || '',
        gstNumber: supplier.gstNumber || '',
        panNumber: supplier.panNumber || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        billingAddress: supplier.billingAddress || supplier.address || '',
        dispatchAddress: supplier.dispatchAddress || '',
        bankName: supplier.bankName || '',
        accountNumber: supplier.accountNumber || '',
        ifscCode: supplier.ifscCode || '',
        paymentTerms: supplier.paymentTerms || '',
        creditLimit: supplier.creditLimit || '',
        status: supplier.status || 'ACTIVE',
      });
    } else {
      setCurrentSupplier(null);
      setFormData(emptyForm);
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => { setIsFormModalOpen(false); setCurrentSupplier(null); };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      if (currentSupplier) {
        await supplierService.updateSupplier(currentSupplier.id, formData);
        showSuccess('Supplier updated successfully.');
      } else {
        await supplierService.createSupplier(formData);
        showSuccess('✅ Supplier created! Login credentials have been emailed to the supplier.');
      }
      handleCloseForm();
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier.');
    } finally { setFormLoading(false); }
  };

  const handleOpenDelete = (supplier) => { setCurrentSupplier(supplier); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    setFormLoading(true);
    try {
      await supplierService.deleteSupplier(currentSupplier.id);
      showSuccess('Supplier deleted.');
      setIsDeleteModalOpen(false);
      fetchSuppliers();
    } catch { showError('Failed to delete supplier.'); }
    finally { setFormLoading(false); }
  };

  const filteredSuppliers = suppliers.filter(sup =>
    sup.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.supplierCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.phone?.includes(searchQuery) ||
    sup.gstNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
          <p className="text-gray-500 text-sm mt-1">Admin-only — credentials are auto-emailed on creation</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Supplier
        </button>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-green-50 border-l-4 border-success text-success font-medium rounded flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/>{successMsg}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-danger text-danger font-medium rounded">{error}</div>}

      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search by code, company, phone, GST..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">{filteredSuppliers.length} suppliers</span>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Company / Contact</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">GST</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
                  <p className="font-medium">No suppliers found</p>
                </td></tr>
              ) : filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4"><span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">{sup.supplierCode || '—'}</span></td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{sup.companyName}</p>
                    <p className="text-xs text-gray-500">{sup.contactPerson || ''}</p>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400"/>{sup.user?.email || '—'}</div>
                  </td>
                  <td className="p-4 text-gray-600">{sup.phone || '—'}</td>
                  <td className="p-4 text-gray-600 font-mono text-xs">{sup.gstNumber || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${sup.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sup.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenForm(sup)} className="p-2 text-primary hover:bg-indigo-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleOpenDelete(sup)} className="p-2 text-danger hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title={currentSupplier ? `Edit Vendor Profile: ${currentSupplier.companyName}` : 'Create Vendor Profile'} maxWidth="max-w-5xl">
        <div className="bg-gray-50 -mx-6 -my-6 p-6">
          {!currentSupplier && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-sm flex items-start gap-3 shadow-sm">
              <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600"/>
              <div>
                <strong className="block font-bold mb-1">Automatic Credential Generation</strong>
                <span>A secure login password will be auto-generated and emailed directly to the supplier upon profile creation.</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSaveSupplier} className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-danger text-sm font-medium shadow-sm">{error}</div>}
            
            {/* Top Bar with Status Pill */}
            {currentSupplier && (
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">Status:</span>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className={`text-sm font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary ${formData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Company Profile */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">1. Company Profile</legend>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Company Name *</label>
                    <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="Apex Textile & Denim Mills" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Primary Contact *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Role</label>
                      <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="Director" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address *</label>
                      <input type="email" required value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
                        placeholder="contact@apex.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Phone Number</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Section 4: Banking & Credit Financials */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">2. Banking & Financials</legend>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Bank Name</label>
                      <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="HDFC Bank" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Account No</label>
                      <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="50200..." />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">IFSC Code</label>
                      <input type="text" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="HDFC0001" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Payment Terms</label>
                      <select value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900">
                        <option value="">Select terms...</option>
                        <option value="Net 15 Days">Net 15 Days</option>
                        <option value="Net 30 Days">Net 30 Days</option>
                        <option value="Net 45 Days">Net 45 Days</option>
                        <option value="Net 60 Days">Net 60 Days</option>
                        <option value="Advance">Advance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Credit Limit (₹)</label>
                      <input type="number" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: e.target.value})}
                        className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold text-indigo-900 text-right" placeholder="5000000.00" />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Section 2: Tax & Compliance */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">3. Tax & Compliance</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono font-bold text-gray-900 tracking-widest" placeholder="07AAACA4102B1Z4" />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono font-bold text-gray-900 tracking-widest" placeholder="AAACA4102B" />
                  </div>
                </div>
              </fieldset>

              {/* Section 3: Address & Logistics */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">4. Address & Logistics</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Registered Billing Address</label>
                    <textarea rows="3" value={formData.billingAddress || formData.address} onChange={e => setFormData({...formData, billingAddress: e.target.value, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed" placeholder="Plot No 45, Phase 2, Industrial Area&#10;New Delhi, India - 110020" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Warehouse Dispatch Address</label>
                    <textarea rows="3" value={formData.dispatchAddress} onChange={e => setFormData({...formData, dispatchAddress: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed" placeholder="Gate No 3, Logistics Park, NH-8&#10;Gurugram, Haryana - 122002" />
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-gray-200 mt-6">
              <button type="button" onClick={handleCloseForm} className="px-8 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold transition-all shadow-sm">
                Cancel
              </button>
              <button type="submit" disabled={formLoading} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                {formLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {currentSupplier ? 'Save Changes' : 'Create Vendor Profile'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Supplier?</h3>
          <p className="text-gray-500 mb-6">Delete <span className="font-bold text-gray-800">{currentSupplier?.companyName}</span>? This cannot be undone.</p>
          <div className="flex justify-center space-x-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
            <button onClick={confirmDelete} disabled={formLoading} className="px-6 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-600 flex items-center">
              {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
