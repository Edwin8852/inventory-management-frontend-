import React, { useState, useEffect } from 'react';
import {
  Loader2, Building2, Mail, Phone, MapPin, Hash, ShieldCheck,
  AlertCircle, User as UserIcon, BadgeCheck
} from 'lucide-react';
import { supplierService } from '../../services/supplier.service';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-4 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-indigo-600" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 font-semibold mt-0.5">{value || <span className="text-gray-300 font-normal">Not provided</span>}</p>
    </div>
  </div>
);

const SupplierProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await supplierService.getProfile();
        setProfile(res.data.data);
      } catch (err) {
        setError('Failed to load your profile. Please contact the admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-3 items-start text-red-700">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const statusColor = profile?.status === 'ACTIVE'
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">Supplier Account</p>
            <h1 className="text-2xl font-extrabold mt-1">{profile?.companyName || profile?.user?.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">{profile?.supplierCode}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${statusColor}`}>
                {profile?.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <p>
          <span className="font-bold">Read-only profile.</span> To update any details, please contact the Admin. Only Admin can modify supplier information.
        </p>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-gray-800">Account Information</h2>
        </div>
        <div className="px-6 divide-y divide-gray-50">
          <InfoRow icon={UserIcon}    label="Contact Person"   value={profile?.contactPerson || profile?.user?.name} />
          <InfoRow icon={Mail}        label="Email Address"    value={profile?.user?.email} />
          <InfoRow icon={Phone}       label="Phone"            value={profile?.phone} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-gray-800">Company Details</h2>
        </div>
        <div className="px-6 divide-y divide-gray-50">
          <InfoRow icon={Building2}   label="Company Name"     value={profile?.companyName} />
          <InfoRow icon={Hash}        label="Supplier Code"    value={profile?.supplierCode} />
          <InfoRow icon={BadgeCheck}  label="GST Number"       value={profile?.gstNumber} />
          <InfoRow icon={MapPin}      label="Address"          value={profile?.address} />
        </div>
      </div>

      {/* Permissions info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" /> Your Access Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'View Product Catalog', allowed: true },
            { label: 'View Wholesale Prices', allowed: true },
            { label: 'Place Bulk Orders', allowed: true },
            { label: 'View Purchase Invoices', allowed: true },
            { label: 'Create / Edit Products', allowed: false },
            { label: 'Manage Inventory', allowed: false },
            { label: 'Manage Categories', allowed: false },
            { label: 'Edit Supplier Profile', allowed: false },
          ].map(({ label, allowed }) => (
            <div key={label} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
              ${allowed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${allowed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-700'}`}>
                {allowed ? '✓' : '✗'}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
