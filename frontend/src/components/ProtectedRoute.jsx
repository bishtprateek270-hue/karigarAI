import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
