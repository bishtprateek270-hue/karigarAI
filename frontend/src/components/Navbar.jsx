import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Package, PlusCircle, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
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

        {user ? (
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/add-product"
              className={`nav-item ${isActive('/add-product') ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>Add Product</span>
            </Link>

            <Link
              to="/my-products"
              className={`nav-item ${isActive('/my-products') ? 'active' : ''}`}
            >
              <Package size={18} />
              <span>My Products</span>
            </Link>

            <div className="user-badge">
              <UserIcon size={14} />
              <span>{user.name}</span>
            </div>

            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
