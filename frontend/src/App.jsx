import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AddProduct } from './pages/AddProduct';
import { MyProducts } from './pages/MyProducts';
import { ProductDetails } from './pages/ProductDetails';
import { EditProduct } from './pages/EditProduct';

const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Artisan Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/my-products" element={<MyProducts />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
              </Route>

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
