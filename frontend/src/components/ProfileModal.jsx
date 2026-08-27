import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, User, Mail, Phone, BookOpen, Save, CheckCircle, Sparkles } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
          const profile = await api.getProfile();
          setName(profile.name || '');
          setEmail(profile.email || '');
          // Strip country code 91 if present for cleaner input display
          let rawPhone = profile.phone || localStorage.getItem('karigar_whatsapp_phone') || '';
          if (rawPhone.startsWith('91') && rawPhone.length === 12) {
            rawPhone = rawPhone.substring(2);
          }
          setPhone(rawPhone);
          setBio(profile.bio || '');
        } catch (err) {
          setError(err.message || 'Failed to load profile details.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const fullPhone = cleanedPhone ? (cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone) : '';

      const updated = await api.updateProfile({
        name: name.trim(),
        phone: fullPhone,
        bio: bio.trim(),
      });

      if (fullPhone) {
        localStorage.setItem('karigar_whatsapp_phone', fullPhone);
      }

      setSuccessMsg('Profile details updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-amber-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-800 to-amber-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-700/80 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">Artisan Profile & Details</h2>
              <p className="text-xs text-amber-200/80">Manage your business contact & heritage bio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white hover:bg-amber-800/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && <div className="p-3 mb-4 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">{error}</div>}
          {successMsg && (
            <div className="p-3 mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading profile details...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Artisan Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address (Verified)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* WhatsApp Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Orders Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500">
                  <span className="inline-flex items-center px-3.5 bg-gray-100 text-gray-700 font-bold text-sm border-r border-gray-300">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-emerald-700 font-medium">
                  ✨ Buyers will use this number to place direct WhatsApp orders for your craft products.
                </p>
              </div>

              {/* Artisan Bio & Heritage */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Artisan Bio & Craft Studio Heritage
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your craft background, family lineage, and studio experience..."
                    className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Profile...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
