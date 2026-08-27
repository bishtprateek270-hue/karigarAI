import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Mail, Phone, BookOpen, Save, CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = ({ lang = 'en' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const profile = await api.getProfile();
        setName(profile.name || '');
        setEmail(profile.email || '');
        
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
  }, []);

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

      setSuccessMsg(lang === 'hi' ? 'आपकी प्रोफ़ाइल जानकारी सफलतापूर्वक सहेजी गई!' : 'Profile details saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link 
          to="/dashboard" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          <span>{lang === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', marginBottom: '28px' }}>
          <div style={{ background: 'var(--primary-color)', color: '#ffffff', padding: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-color)', margin: 0, fontFamily: 'serif' }}>
              {lang === 'hi' ? 'कारीगर प्रोफाइल और व्यवसाय विवरण' : 'Artisan Profile & Business Details'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>
              {lang === 'hi' ? 'अपनी संपर्क जानकारी और सांस्कृतिक विरासत कहानी प्रबंधित करें' : 'Manage your business contact details and heritage story'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '14px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', color: '#166534', padding: '14px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#16a34a" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)', fontSize: '1rem' }}>
            {lang === 'hi' ? 'प्रोफ़ाइल जानकारी लोड हो रही है...' : 'Loading profile details...'}
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Full Name */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'कारीगर का पूरा नाम' : 'Artisan Full Name'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prateek Sharma"
                  className="form-control"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'पंजीकृत ईमेल पता (सत्यापित)' : 'Registered Email Address (Verified)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="form-control"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#f5f5f5', color: '#666', fontSize: '0.95rem', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* WhatsApp Mobile Number */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'व्हाट्सएप ऑर्डर मोबाइल नंबर' : 'WhatsApp Orders Mobile Number'}
              </label>
              <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <span style={{ padding: '12px 16px', background: '#f5f5f5', fontWeight: '700', color: 'var(--text-color)', fontSize: '0.95rem', borderRight: '1px solid var(--border-color)' }}>
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  style={{ flex: 1, padding: '12px 14px', border: 'none', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#166534', margin: '4px 0 0 0', fontWeight: '500' }}>
                ✨ {lang === 'hi' ? 'ग्राहक सीधे इस मोबाइल नंबर पर व्हाट्सएप द्वारा आपके हस्तशिल्प ऑर्डर कर सकेंगे।' : 'Buyers will use this number to place direct WhatsApp orders for your craft products.'}
              </p>
            </div>

            {/* Artisan Bio */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'कारीगर बायो और शिल्प अनुभव' : 'Artisan Bio & Craft Studio Heritage'}
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={lang === 'hi' ? 'अपनी शिल्प कला, पारिवारिक विरासत और कार्य अनुभव के बारे में लिखें...' : 'Describe your craft background, family lineage, and studio experience...'}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', lineHeight: '1.6' }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '10px', cursor: saving ? 'wait' : 'pointer' }}
              >
                <Save size={18} />
                <span>{saving ? (lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving Profile...') : (lang === 'hi' ? 'प्रोफ़ाइल विवरण सहेजें' : 'Save Profile Details')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
