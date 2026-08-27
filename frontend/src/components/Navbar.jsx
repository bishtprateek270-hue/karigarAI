import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, Package, PlusCircle, LayoutDashboard, LogOut, User as UserIcon, Globe } from 'lucide-react';

export const Navbar = ({ currentLang = 'en', onLangChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={user ? "/dashboard" : "/"} className="logo-link">
          <Sparkles size={26} color="var(--primary-color)" />
          <span>KarigarAI</span>
        </Link>

        <div className="nav-links">
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#faf7f3', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Globe size={16} color="var(--primary-color)" />
            <select
              value={currentLang}
              onChange={(e) => onLangChange && onLangChange(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>{currentLang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
              </Link>

              <Link
                to="/add-product"
                className={`nav-item ${isActive('/add-product') ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>{currentLang === 'hi' ? 'उत्पाद जोड़ें' : 'Add Product'}</span>
              </Link>

              <Link
                to="/my-products"
                className={`nav-item ${isActive('/my-products') ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>{currentLang === 'hi' ? 'मेरे उत्पाद' : 'My Products'}</span>
              </Link>

              <div 
                className="user-badge"
                style={{ cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    const profile = await api.getProfile();
                    const currentPhone = profile.phone || '919876543210';
                    const newPhone = window.prompt('Update your Artisan WhatsApp phone number (with country code):', currentPhone);
                    if (newPhone !== null && newPhone.trim()) {
                      const cleaned = newPhone.replace(/\D/g, '');
                      if (cleaned.length >= 10) {
                        await api.updateProfile({ phone: cleaned });
                        localStorage.setItem('karigar_whatsapp_phone', cleaned);
                        alert('Artisan WhatsApp phone number saved to your profile!');
                      } else {
                        alert('Please enter a valid phone number with country code (e.g. 919876543210).');
                      }
                    }
                  } catch (e) {
                    alert(e.message || 'Failed to update profile.');
                  }
                }}
                title="Click to update your WhatsApp phone number"
              >
                <UserIcon size={14} />
                <span>{user.name}</span>
              </div>

              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                <span>{currentLang === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                {currentLang === 'hi' ? 'लॉग इन' : 'Login'}
              </Link>
              <Link to="/register" className="btn-primary">
                {currentLang === 'hi' ? 'पंजीकरण करें' : 'Register'}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
