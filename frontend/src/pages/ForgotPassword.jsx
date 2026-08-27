import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { KeyRound, Mail, Lock, CheckCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';

export const ForgotPassword = ({ lang = 'en' }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [receivedOtpInfo, setReceivedOtpInfo] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.requestPasswordResetOtp(email.trim());
      setStep(2);
      setSuccessMsg(lang === 'hi' ? '6-अंकीय ओटीपी कोड आपके ईमेल पर भेजा गया है!' : '6-digit OTP verification code sent to your email!');
      if (res.otp) {
        setReceivedOtpInfo(`Verification OTP Code: ${res.otp}`);
        setOtp(res.otp); // Pre-fill for convenience
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.resetPasswordWithOtp(email.trim(), otp.trim(), newPassword.trim());
      setSuccessMsg(lang === 'hi' ? 'पासवर्ड सफलतापूर्वक अपडेट हो गया! लॉगिन पृष्ठ पर रीडायरेक्ट किया जा रहा है...' : 'Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link 
          to="/login" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>{lang === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--primary-color)', color: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <KeyRound size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color)', margin: 0, fontFamily: 'serif' }}>
            {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '6px 0 0 0' }}>
            {step === 1 
              ? (lang === 'hi' ? 'ओटीपी प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें' : 'Enter your registered email address to receive an OTP verification code')
              : (lang === 'hi' ? 'नया पासवर्ड सेट करने के लिए 6-अंकीय ओटीपी दर्ज करें' : 'Enter the 6-digit OTP code and set your new password')}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#16a34a" />
            <span>{successMsg}</span>
          </div>
        )}

        {receivedOtpInfo && step === 2 && (
          <div style={{ background: '#fffbeb', color: '#92400e', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Sparkles size={16} color="#d97706" />
            <span>{receivedOtpInfo}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'ईमेल पता' : 'Registered Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artisan@example.com"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', gap: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer' }}
            >
              <Send size={16} />
              <span>{loading ? (lang === 'hi' ? 'ओटीपी भेजा जा रहा है...' : 'Sending OTP Code...') : (lang === 'hi' ? 'ओटीपी कोड भेजें' : 'Send Verification OTP')}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? '6-अंकीय ओटीपी कोड' : '6-Digit OTP Code'}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '1.1rem', fontWeight: '700', letterSpacing: '4px', textAlign: 'center', outline: 'none' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'नया पासवर्ड' : 'New Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', gap: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer' }}
            >
              <Lock size={16} />
              <span>{loading ? (lang === 'hi' ? 'पासवर्ड अपडेट हो रहा है...' : 'Resetting Password...') : (lang === 'hi' ? 'पासवर्ड अपडेट करें और लॉगिन करें' : 'Reset Password & Log In')}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
              >
                {lang === 'hi' ? 'अलग ईमेल आज़माएं' : 'Resend OTP to different email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
