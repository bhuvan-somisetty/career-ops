'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Briefcase,
  Target,
  Sparkles
} from 'lucide-react';

interface ProfileData {
  candidate?: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  target_roles?: {
    primary: string[];
  };
  narrative?: {
    headline: string;
    exit_story: string;
    superpowers: string[];
  };
  compensation?: {
    target_range: string;
    currency: string;
    minimum: string;
    location_flexibility: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    candidate: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    target_roles: { primary: [] },
    narrative: { headline: '', exit_story: '', superpowers: [] },
    compensation: { target_range: '', currency: 'INR', minimum: '', location_flexibility: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load profile yml
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile({
          candidate: data.candidate || { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
          target_roles: data.target_roles || { primary: [] },
          narrative: data.narrative || { headline: '', exit_story: '', superpowers: [] },
          compensation: data.compensation || { target_range: '', currency: 'INR', minimum: '', location_flexibility: '' }
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
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setMessage({ text: 'Profile configuration updated successfully.', type: 'success' });
      } else {
        setMessage({ text: 'Failed to write profile configurations.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const updateCandidate = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      candidate: { ...prev.candidate!, [key]: value }
    }));
  };

  const updateNarrative = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      narrative: { ...prev.narrative!, [key]: value }
    }));
  };

  const addRole = () => {
    if (!newRole.trim()) return;
    const roles = [...(profile.target_roles?.primary || [])];
    roles.push(newRole.trim());
    setProfile(prev => ({
      ...prev,
      target_roles: { ...prev.target_roles!, primary: roles }
    }));
    setNewRole('');
  };

  const removeRole = (index: number) => {
    const roles = [...(profile.target_roles?.primary || [])].filter((_, i) => i !== index);
    setProfile(prev => ({
      ...prev,
      target_roles: { ...prev.target_roles!, primary: roles }
    }));
  };

  const addSuperpower = () => {
    const powers = [...(profile.narrative?.superpowers || [])];
    powers.push('New Competency');
    setProfile(prev => ({
      ...prev,
      narrative: { ...prev.narrative!, superpowers: powers }
    }));
  };

  const updateSuperpower = (index: number, value: string) => {
    const powers = [...(profile.narrative?.superpowers || [])];
    powers[index] = value;
    setProfile(prev => ({
      ...prev,
      narrative: { ...prev.narrative!, superpowers: powers }
    }));
  };

  const removeSuperpower = (index: number) => {
    const powers = [...(profile.narrative?.superpowers || [])].filter((_, i) => i !== index);
    setProfile(prev => ({
      ...prev,
      narrative: { ...prev.narrative!, superpowers: powers }
    }));
  };

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-mono text-xs">Loading profile settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Professional Profile Context</h2>
          <p className="text-zinc-500 text-xs font-mono">Customize narrative details used in evaluations</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Profile'}
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

      {/* Profile Sections */}
      <div className="space-y-6">
        {/* Candidate Info */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-300">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Contact Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Full Name</label>
              <input
                type="text"
                value={profile.candidate?.full_name || ''}
                onChange={(e) => updateCandidate('full_name', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Email Address</label>
              <input
                type="email"
                value={profile.candidate?.email || ''}
                onChange={(e) => updateCandidate('email', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Location</label>
              <input
                type="text"
                value={profile.candidate?.location || ''}
                onChange={(e) => updateCandidate('location', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">LinkedIn Profile</label>
              <input
                type="text"
                value={profile.candidate?.linkedin || ''}
                onChange={(e) => updateCandidate('linkedin', e.target.value)}
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Target Roles */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-300">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Target Roles (North Star)</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new role title..."
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 p-2.5 rounded-lg glass-input text-xs"
              />
              <button
                type="button"
                onClick={addRole}
                className="px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(profile.target_roles?.primary || []).map((role, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-850 text-zinc-300 text-xs flex items-center gap-2"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(i)}
                    className="text-zinc-500 hover:text-red-400 font-bold font-mono text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Context */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Adaptive Framing Narrative</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Professional Headline</label>
              <input
                type="text"
                value={profile.narrative?.headline || ''}
                onChange={(e) => updateNarrative('headline', e.target.value)}
                placeholder="e.g. ML Engineer turned AI product builder"
                className="w-full p-2.5 rounded-lg glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 block">Exit Story</label>
              <textarea
                value={profile.narrative?.exit_story || ''}
                onChange={(e) => updateNarrative('exit_story', e.target.value)}
                rows={4}
                placeholder="Brief exit explanation or professional backstory used to answer application forms."
                className="w-full p-2.5 rounded-lg glass-input text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* Superpowers */}
        <div className="p-6 rounded-xl glass-panel space-y-4 border border-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold">Core Superpowers</h3>
            </div>
            <button
              type="button"
              onClick={addSuperpower}
              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {(profile.narrative?.superpowers || []).map((power, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={power}
                  onChange={(e) => updateSuperpower(index, e.target.value)}
                  className="flex-1 p-2.5 rounded-lg glass-input text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeSuperpower(index)}
                  className="p-2.5 rounded-lg border border-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-950 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
