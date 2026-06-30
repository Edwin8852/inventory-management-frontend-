import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/setting.service';
import { Save, Loader2 } from 'lucide-react';

const SupplierSettings = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    bankDetails: '',
    notificationPreferences: { email: true, sms: false }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingService.getSupplierSettings();
      const settings = res.data.data;
      if (settings) {
        setFormData({
          businessName: settings.businessName || '',
          gstNumber: settings.gstNumber || '',
          address: settings.address || '',
          phoneNumber: settings.phoneNumber || '',
          email: settings.email || '',
          bankDetails: settings.bankDetails || '',
          notificationPreferences: settings.notificationPreferences || { email: true, sms: false }
        });
      }
    } catch (error) {
      console.error('Failed to load supplier settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await settingService.updateSupplierSettings(formData);
      setSuccessMsg('Supplier Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supplier Settings</h1>
          <p className="text-sm text-gray-500">Configure your business and payment details.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-success p-4 rounded-xl font-medium border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Supplier Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input 
                  type="text" required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input 
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
                <textarea 
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({...formData, bankDetails: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Bank Name, Account Number, IFSC Code"
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Notification Preferences</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox"
                  checked={formData.notificationPreferences.email}
                  onChange={(e) => setFormData({
                    ...formData, 
                    notificationPreferences: { ...formData.notificationPreferences, email: e.target.checked }
                  })}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                Email Notifications
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox"
                  checked={formData.notificationPreferences.sms}
                  onChange={(e) => setFormData({
                    ...formData, 
                    notificationPreferences: { ...formData.notificationPreferences, sms: e.target.checked }
                  })}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                SMS Notifications
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-md flex items-center"
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SupplierSettings;
