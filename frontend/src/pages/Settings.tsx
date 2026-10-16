import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Save,
  CheckCircle,
  School,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';

export const SchoolSettingsView: React.FC = () => {
  const { schoolSettings, refreshSettings } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    campusName: '',
    registrationNumber: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    currency: 'PKR',
    currencySymbol: '₨',
    timezone: 'Asia/Karachi',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (schoolSettings) {
      setFormData({
        schoolName: schoolSettings.schoolName || '',
        campusName: schoolSettings.campusName || '',
        registrationNumber: schoolSettings.registrationNumber || '',
        address: schoolSettings.address || '',
        phone: schoolSettings.phone || '',
        email: schoolSettings.email || '',
        website: schoolSettings.website || '',
        principalName: schoolSettings.principalName || '',
        currency: schoolSettings.currency || 'PKR',
        currencySymbol: schoolSettings.currencySymbol || '₨',
        timezone: schoolSettings.timezone || 'Asia/Karachi',
      });
    }
  }, [schoolSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(formData);
      await refreshSettings();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">School Configuration & Branding</h2>
        <p className="text-xs text-slate-500">
          General school settings, national registration number, currency (PKR), and timezone (Asia/Karachi)
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>School settings updated successfully across the entire system.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Institutional Identification & Logo</h3>

        {/* Logo Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
            <img
              src={schoolSettings?.logoUrl || '/kiva-logo.png'}
              alt="Kiva School Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 text-sm">Official Institutional Logo</h4>
            <p className="text-slate-500 text-xs">
              This logo is active across the Navigation Bar, Sidebar, Login Portal, Student ID Cards, 3-Part Bank Fee Challans, and Academic Progress Reports.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Active Logo: /kiva-logo.png</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus / Branch Name</label>
            <input
              type="text"
              value={formData.campusName}
              onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Government Registration Number</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Principal / Headmaster Name</label>
            <input
              type="text"
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm border-b pb-2 pt-3">Location & Contact</h3>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Telephone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm border-b pb-2 pt-3">Regional & Currency Defaults</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency Code</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Timezone</label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save School Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
