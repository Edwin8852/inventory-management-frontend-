import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/setting.service';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

const baseUrl = API_BASE_URL.replace('/api', '');

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    defaultGstRate: 18,
    currency: 'INR',
    receiptFooter: ''
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
    try {
      const res = await settingService.getSettings();
      const settings = res.data.data;
      if (settings) {
        setFormData({
          companyName: settings.companyName || '',
          gstNumber: settings.gstNumber || '',
          defaultGstRate: settings.defaultGstRate || 18,
          currency: settings.currency || 'INR',
          receiptFooter: settings.receiptFooter || ''
        });
        setCurrentLogo(settings.companyLogo);
      }
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      if (logoFile) {
        payload.append('companyLogo', logoFile);
      }
      
      const res = await settingService.updateSettings(payload);
      setCurrentLogo(res.data.data.companyLogo);
      setSuccessMsg('Settings saved successfully!');
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
          <h1 className="text-2xl font-bold text-gray-800">Global Settings</h1>
          <p className="text-sm text-gray-500">Configure your company profile and ERP defaults.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-success p-4 rounded-xl font-medium border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* Company Profile */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Company Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" required
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {logoFile ? (
                      <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentLogo ? (
                      <img src={`${baseUrl}${currentLogo}`} alt="Current Logo" className="w-full h-full object-cover" />
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
            </div>
          </div>

          {/* Billing & Invoice Defaults */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Billing & Invoice Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default GST Rate (%)</label>
                <select 
                  value={formData.defaultGstRate}
                  onChange={(e) => setFormData({...formData, defaultGstRate: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <select 
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="INR">₹ (INR)</option>
                  <option value="USD">₹ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                  <option value="GBP">£ (GBP)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer Text</label>
                <textarea 
                  value={formData.receiptFooter}
                  onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Thank you for your business!"
                ></textarea>
              </div>
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

export default Settings;
