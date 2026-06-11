'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  AlertCircle,
  HelpCircle,
  Settings,
  DollarSign,
  MapPin,
  Cpu,
  LogOut
} from 'lucide-react';

interface ProfileData {
  compensation?: {
    target_range: string;
    currency: string;
    minimum: string;
    location_flexibility: string;
  };
  location?: {
    country: string;
    city: string;
    timezone: string;
    visa_status: string;
  };
  auto_pdf_score_threshold?: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    compensation: { target_range: '', currency: 'INR', minimum: '', location_flexibility: '' },
    location: { country: '', city: '', timezone: '', visa_status: '' },
    auto_pdf_score_threshold: 4.0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load config yml
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile({
          compensation: data.compensation || { target_range: '', currency: 'INR', minimum: '', location_flexibility: '' },
          location: data.location || { country: '', city: '', timezone: '', visa_status: '' },
          auto_pdf_score_threshold: data.auto_pdf_score_threshold ?? 4.0
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const getRes = await fetch('/api/profile');
      const original = await getRes.json();

      const merged = {
        ...original,
        compensation: profile.compensation,
        location: profile.location,
        auto_pdf_score_threshold: profile.auto_pdf_score_threshold
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });

      if (res.ok) {
        setMessage({ text: 'Platform settings saved successfully.', type: 'success' });
      } else {
        setMessage({ text: 'Failed to write configurations.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const updateCompensation = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      compensation: { ...prev.compensation!, [key]: value }
    }));
  };

  const updateLocation = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      location: { ...prev.location!, [key]: value }
    }));
  };

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-mono text-xs">Loading application settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Platform Settings</h2>
          <p className="text-zinc-500 text-xs font-mono">Manage operational targets and system configurations</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* Target Compensation */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-300">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Compensation Targets</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Target Comp Range</label>
              <input
                type="text"
                value={profile.compensation?.target_range || ''}
                onChange={(e) => updateCompensation('target_range', e.target.value)}
                placeholder="e.g. ₹12L-25L"
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Base Currency</label>
              <select
                value={profile.compensation?.currency || 'INR'}
                onChange={(e) => updateCompensation('currency', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs bg-zinc-950 text-zinc-300 focus:outline-none border border-zinc-900"
              >
                <option value="INR" className="bg-zinc-950 text-zinc-300">INR (₹)</option>
                <option value="USD" className="bg-zinc-950 text-zinc-300">USD ($)</option>
                <option value="EUR" className="bg-zinc-950 text-zinc-300">EUR (€)</option>
                <option value="GBP" className="bg-zinc-950 text-zinc-300">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Walk-away Minimum</label>
              <input
                type="text"
                value={profile.compensation?.minimum || ''}
                onChange={(e) => updateCompensation('minimum', e.target.value)}
                placeholder="e.g. ₹10L"
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Location & Policies */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Location & Visa Preferences</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">City</label>
              <input
                type="text"
                value={profile.location?.city || ''}
                onChange={(e) => updateLocation('city', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Country</label>
              <input
                type="text"
                value={profile.location?.country || ''}
                onChange={(e) => updateLocation('country', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Timezone</label>
              <input
                type="text"
                value={profile.location?.timezone || ''}
                onChange={(e) => updateLocation('timezone', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Visa Status</label>
              <input
                type="text"
                value={profile.location?.visa_status || ''}
                onChange={(e) => updateLocation('visa_status', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
          </div>
              </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-xl bg-red-950/10 border border-red-900/30 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <LogOut className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Danger Zone</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-300 block">Log Out of Workspace</span>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-md">
                End your current local student career console session. This will clear client authorization credentials and redirect to the landing page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-red-950/60 border border-red-900/40 hover:bg-red-600 hover:text-white text-red-400 font-bold text-xs transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400/50"
            >
              Log Out Console
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-50 space-y-5"
            >
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider font-mono">Confirm Log Out</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                  Are you sure you want to log out of the student workspace? You will need to complete onboarding or have active credentials to enter again.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800 text-xs font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('career_ops_logged_in');
                    localStorage.removeItem('career_ops_token');
                    router.push('/portal');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500 font-bold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/60"
                >
                  <LogOut className="w-4 h-4" />
                  Confirm Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
