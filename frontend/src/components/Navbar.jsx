import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

              <Link
                to="/profile"
                className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                title="Manage your Artisan Profile"
              >
                <UserIcon size={18} />
                <span>{user.name}</span>
              </Link>

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
