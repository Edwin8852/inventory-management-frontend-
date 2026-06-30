import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/setting.service';
import { Save, Image as ImageIcon, Loader2, Building, Receipt, Package, Users, Shield } from 'lucide-react';

const TABS = [
  { id: 'company', label: 'Company Profile', icon: Building },
  { id: 'invoice', label: 'Invoice & Tax', icon: Receipt },
  { id: 'inventory', label: 'Inventory Rules', icon: Package },
  { id: 'defaults', label: 'Customer & Vendor', icon: Users },
  { id: 'rbac', label: 'Access Control', icon: Shield },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('company');
  
  // State for all categories
  const [companyData, setCompanyData] = useState({
    companyName: 'X town Gobal Private Limited',
    gstNumber: '',
    panNumber: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [invoiceData, setInvoiceData] = useState({
    invoicePrefix: 'INV-2026-',
    purchasePrefix: 'PURCH-',
    nextSequence: '0001',
    defaultGstRate: 18,
    currency: 'INR',
    invoiceTerms: 'Thank you for your business!'
  });

  const [inventoryData, setInventoryData] = useState({
    moq: 20,
    lowStockTrigger: 50,
    sizes: {
      'UK-30': true,
      'UK-32': true,
      'UK-34': true,
      'UK-36': true
    }
  });

  const [defaultsData, setDefaultsData] = useState({
    defaultCreditLimit: 500000,
    creditWindowDays: 30,
    autoReminders: true
  });

  const [rbacData, setRbacData] = useState({
    roles: [
      { name: 'Super Admin', viewInventory: true, editInvoices: true, modifySuppliers: true, adminSettings: true },
      { name: 'Billing Clerk', viewInventory: true, editInvoices: true, modifySuppliers: false, adminSettings: false },
      { name: 'Warehouse Staff', viewInventory: true, editInvoices: false, modifySuppliers: false, adminSettings: false },
    ]
  });

  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [companyRes, invoiceRes, inventoryRes, defaultsRes, rbacRes] = await Promise.all([
        settingService.getSystemSettings('company').catch(() => ({ data: { data: {} } })),
        settingService.getSystemSettings('invoice').catch(() => ({ data: { data: {} } })),
        settingService.getSystemSettings('inventory').catch(() => ({ data: { data: {} } })),
        settingService.getSystemSettings('defaults').catch(() => ({ data: { data: {} } })),
        settingService.getSystemSettings('rbac').catch(() => ({ data: { data: {} } }))
      ]);

      if (companyRes.data.data) {
        setCompanyData(prev => ({ ...prev, ...companyRes.data.data }));
        setCurrentLogo(companyRes.data.data.companyLogo);
      }
      if (invoiceRes.data.data && Object.keys(invoiceRes.data.data).length > 0) {
        setInvoiceData(prev => ({ ...prev, ...invoiceRes.data.data }));
      }
      if (inventoryRes.data.data && Object.keys(inventoryRes.data.data).length > 0) {
        setInventoryData(prev => ({ ...prev, ...inventoryRes.data.data }));
      }
      if (defaultsRes.data.data && Object.keys(defaultsRes.data.data).length > 0) {
        setDefaultsData(prev => ({ ...prev, ...defaultsRes.data.data }));
      }
      if (rbacRes.data.data && Object.keys(rbacRes.data.data).length > 0) {
        setRbacData(prev => ({ ...prev, ...rbacRes.data.data }));
      }
    } catch (error) {
      console.error('Failed to load system settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      if (activeTab === 'company') {
        const payload = new FormData();
        Object.keys(companyData).forEach(key => payload.append(key, companyData[key]));
        if (logoFile) {
          payload.append('companyLogo', logoFile);
        }
        const res = await settingService.updateSystemSettings('company', payload);
        if (res.data.data?.companyLogo) {
          setCurrentLogo(res.data.data.companyLogo);
        }
      } else if (activeTab === 'invoice') {
        await settingService.updateSystemSettings('invoice', invoiceData);
      } else if (activeTab === 'inventory') {
        await settingService.updateSystemSettings('inventory', inventoryData);
      } else if (activeTab === 'defaults') {
        await settingService.updateSystemSettings('defaults', defaultsData);
      } else if (activeTab === 'rbac') {
        await settingService.updateSystemSettings('rbac', rbacData);
      }

      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSizeToggle = (size) => {
    setInventoryData({
      ...inventoryData,
      sizes: { ...inventoryData.sizes, [size]: !inventoryData.sizes[size] }
    });
  };

  const handleRoleToggle = (index, field) => {
    const newRoles = [...rbacData.roles];
    newRoles[index][field] = !newRoles[index][field];
    setRbacData({ ...rbacData, roles: newRoles });
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Unified System Settings</h1>
          <p className="text-sm text-gray-500">Manage global configurations, invoice rules, and user permissions.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-success p-4 rounded-xl font-medium border border-green-100 flex items-center">
          <Save className="w-5 h-5 mr-2" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSuccessMsg(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-100' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSave} className="p-6 md:p-8">
            
            {/* COMPANY PROFILE */}
            {activeTab === 'company' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Company Profile & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Entity Name</label>
                    <input 
                      type="text" required
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corporate GSTIN</label>
                    <input 
                      type="text"
                      value={companyData.gstNumber}
                      onChange={(e) => setCompanyData({...companyData, gstNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corporate PAN</label>
                    <input 
                      type="text"
                      value={companyData.panNumber}
                      onChange={(e) => setCompanyData({...companyData, panNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Global Logo Upload</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {logoFile ? (
                          <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : currentLogo ? (
                          <img src={`http://localhost:5000${currentLogo}`} alt="Current Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-indigo-100 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">Upload a PNG or JPG image. Max size 2MB.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                    <input 
                      type="text"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input 
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Registry Address</label>
                    <textarea 
                      value={companyData.address}
                      onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* INVOICE & TAX */}
            {activeTab === 'invoice' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Invoice & Tax Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sales Invoice Prefix</label>
                    <input 
                      type="text"
                      value={invoiceData.invoicePrefix}
                      onChange={(e) => setInvoiceData({...invoiceData, invoicePrefix: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Invoice Prefix</label>
                    <input 
                      type="text"
                      value={invoiceData.purchasePrefix}
                      onChange={(e) => setInvoiceData({...invoiceData, purchasePrefix: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Sequence Number</label>
                    <input 
                      type="text"
                      value={invoiceData.nextSequence}
                      onChange={(e) => setInvoiceData({...invoiceData, nextSequence: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default GST Rate (%)</label>
                    <select 
                      value={invoiceData.defaultGstRate}
                      onChange={(e) => setInvoiceData({...invoiceData, defaultGstRate: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Invoice Terms (Fine Print)</label>
                    <textarea 
                      value={invoiceData.invoiceTerms}
                      onChange={(e) => setInvoiceData({...invoiceData, invoiceTerms: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTORY RULES */}
            {activeTab === 'inventory' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Inventory & Order Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Global Minimum Order Quantity (MOQ)</label>
                    <input 
                      type="number"
                      value={inventoryData.moq}
                      onChange={(e) => setInventoryData({...inventoryData, moq: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low-Stock Alert Trigger</label>
                    <input 
                      type="number"
                      value={inventoryData.lowStockTrigger}
                      onChange={(e) => setInventoryData({...inventoryData, lowStockTrigger: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Size Matrix Defaults (Active Sizes)</label>
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(inventoryData.sizes).map(size => (
                        <label key={size} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input 
                            type="checkbox"
                            checked={inventoryData.sizes[size]}
                            onChange={() => handleSizeToggle(size)}
                            className="w-4 h-4 text-primary focus:ring-primary rounded"
                          />
                          <span className="text-sm font-medium text-gray-800">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULTS */}
            {activeTab === 'defaults' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Customer & Vendor Default Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Client Credit Limit (₹)</label>
                    <input 
                      type="number"
                      value={defaultsData.defaultCreditLimit}
                      onChange={(e) => setDefaultsData({...defaultsData, defaultCreditLimit: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Credit Window (Days)</label>
                    <input 
                      type="number"
                      value={defaultsData.creditWindowDays}
                      onChange={(e) => setDefaultsData({...defaultsData, creditWindowDays: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 border rounded-xl cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={defaultsData.autoReminders}
                        onChange={(e) => setDefaultsData({...defaultsData, autoReminders: e.target.checked})}
                        className="w-5 h-5 text-primary focus:ring-primary rounded"
                      />
                      <div>
                        <p className="font-bold text-gray-800">Automated Payment Reminders</p>
                        <p className="text-sm text-gray-500">Automatically email clients when their outstanding balance exceeds the credit window.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* RBAC */}
            {activeTab === 'rbac' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-4">User Roles & Access Control</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-4 text-sm font-bold text-gray-700">Role</th>
                        <th className="p-4 text-sm font-bold text-gray-700 text-center">View Inventory</th>
                        <th className="p-4 text-sm font-bold text-gray-700 text-center">Edit Invoices</th>
                        <th className="p-4 text-sm font-bold text-gray-700 text-center">Modify Suppliers</th>
                        <th className="p-4 text-sm font-bold text-gray-700 text-center">Admin Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rbacData.roles.map((role, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-900">{role.name}</td>
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={role.viewInventory} onChange={() => handleRoleToggle(idx, 'viewInventory')} className="w-5 h-5 text-primary rounded" />
                          </td>
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={role.editInvoices} onChange={() => handleRoleToggle(idx, 'editInvoices')} className="w-5 h-5 text-primary rounded" />
                          </td>
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={role.modifySuppliers} onChange={() => handleRoleToggle(idx, 'modifySuppliers')} className="w-5 h-5 text-primary rounded" />
                          </td>
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={role.adminSettings} onChange={() => handleRoleToggle(idx, 'adminSettings')} className="w-5 h-5 text-primary rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-3">* Role changes applied here will affect the authorization middleware on the backend API.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-8 mt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {saving ? 'Saving Tab...' : `Save ${TABS.find(t => t.id === activeTab).label}`}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
