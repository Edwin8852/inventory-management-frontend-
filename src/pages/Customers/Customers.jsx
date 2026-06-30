import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle, Eye } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import Modal from '../../components/ui/Modal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  const initialFormState = { name: '', phone: '', email: '', address: '', billingAddress: '', dispatchAddress: '', gstNumber: '', panNumber: '', bankName: '', accountNumber: '', ifscCode: '', paymentTerms: '', creditLimit: '' };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers();
      // Adjust based on typical backend response format. 
      // User prompt said "customerName", but sometimes backend says "name".
      setCustomers(res.data.data || []);
    } catch (err) {
      showError('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const handleOpenForm = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData({ 
        name: customer.user?.name || customer.name || customer.customerName || '', 
        phone: customer.phone || '', 
        email: customer.user?.email || customer.email || '', 
        address: customer.address || '', 
        billingAddress: customer.billingAddress || customer.address || '',
        dispatchAddress: customer.dispatchAddress || '',
        gstNumber: customer.gstNumber || '',
        panNumber: customer.panNumber || '',
        bankName: customer.bankName || '',
        accountNumber: customer.accountNumber || '',
        ifscCode: customer.ifscCode || '',
        paymentTerms: customer.paymentTerms || '',
        creditLimit: customer.creditLimit || ''
      });
    } else {
      setCurrentCustomer(null);
      setFormData(initialFormState);
    }
    setIsFormModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (currentCustomer) {
        await customerService.updateCustomer(currentCustomer.id, formData);
        showSuccess('Customer updated successfully.');
      } else {
        await customerService.createCustomer(formData);
        showSuccess('Customer added successfully.');
      }
      setIsFormModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer.');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    setFormLoading(true);
    try {
      await customerService.deleteCustomer(currentCustomer.id);
      showSuccess('Customer deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showError('Failed to delete customer.');
    } finally {
      setFormLoading(false);
    }
  };

  const openProfile = (customer) => {
    setCurrentCustomer(customer);
    setIsProfileModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    (c.user?.name || c.name || c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <button onClick={() => handleOpenForm()} className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Customer
        </button>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-green-50 border-l-4 border-success text-success">{successMsg}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-danger text-danger">{error}</div>}

      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">GST</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
            ) : filteredCustomers.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{c.user?.name || c.name || c.customerName}</td>
                <td className="p-4 text-gray-600">
                  <div>{c.phone}</div>
                  <div className="text-sm text-gray-400">{c.user?.email || c.email}</div>
                </td>
                <td className="p-4 text-gray-600">{c.gstNumber || 'N/A'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openProfile(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleOpenForm(c)} className="p-2 text-primary hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { setCurrentCustomer(c); setIsDeleteModalOpen(true); }} className="p-2 text-danger hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Customer Profile">
        {currentCustomer && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800">{currentCustomer.user?.name || currentCustomer.name || currentCustomer.customerName}</h3>
              <p className="text-gray-600 mt-2"><strong>Phone:</strong> {currentCustomer.phone}</p>
              <p className="text-gray-600"><strong>Email:</strong> {currentCustomer.user?.email || currentCustomer.email}</p>
              <p className="text-gray-600"><strong>GST:</strong> {currentCustomer.gstNumber}</p>
              <p className="text-gray-600"><strong>Address:</strong> {currentCustomer.address}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Purchase History Placeholder</h4>
              <p className="text-gray-500 text-sm italic">Connects to Order APIs in Billing Module.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentCustomer ? `Edit Customer Profile: ${currentCustomer.user?.name || currentCustomer.name || currentCustomer.customerName}` : 'Create Customer Profile'} maxWidth="max-w-5xl">
        <div className="bg-gray-50 -mx-6 -my-6 p-6">
          <form onSubmit={handleSaveCustomer} className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-danger text-sm font-medium shadow-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Customer Profile */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">1. Customer Profile</legend>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Customer Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900" placeholder="customer@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Phone Number *</label>
                      <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Payment Terms</label>
                      <select value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900">
                        <option value="">Select terms...</option>
                        <option value="Net 15 Days">Net 15 Days</option>
                        <option value="Net 30 Days">Net 30 Days</option>
                        <option value="Net 45 Days">Net 45 Days</option>
                        <option value="Advance">Advance</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Section 2: Tax & Compliance */}
              <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <legend className="px-2 text-sm font-black text-indigo-600 uppercase tracking-wider bg-white -ml-2">3. Tax & Compliance</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">GSTIN</label>
                    <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono font-bold text-gray-900 tracking-widest" placeholder="07AAACA4102B1Z4" />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">PAN Number</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Registered Billing Address *</label>
                    <textarea rows="3" required value={formData.billingAddress || formData.address} onChange={e => setFormData({...formData, billingAddress: e.target.value, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed" placeholder="123 Retail Street&#10;Mumbai, India - 400001" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Delivery / Store Address</label>
                    <textarea rows="3" value={formData.dispatchAddress} onChange={e => setFormData({...formData, dispatchAddress: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed" placeholder="Store #5, Mall Road&#10;Mumbai, India - 400001" />
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-gray-200 mt-6">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-8 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold transition-all shadow-sm">
                Cancel
              </button>
              <button type="submit" disabled={formLoading} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                {formLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {currentCustomer ? 'Save Changes' : 'Create Customer Profile'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Customer?</h3>
          <div className="flex justify-center space-x-3 mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={confirmDelete} className="px-6 py-2 bg-danger text-white rounded-lg">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
