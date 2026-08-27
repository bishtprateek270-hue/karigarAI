import React, { useState } from 'react';
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
import { Profile } from './pages/Profile';

const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar currentLang={currentLang} onLangChange={setCurrentLang} />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login lang={currentLang} />} />
              <Route path="/register" element={<Register lang={currentLang} />} />

              {/* Protected Artisan Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard lang={currentLang} />} />
                <Route path="/add-product" element={<AddProduct lang={currentLang} />} />
                <Route path="/my-products" element={<MyProducts lang={currentLang} />} />
                <Route path="/profile" element={<Profile lang={currentLang} />} />
                <Route path="/products/:id" element={<ProductDetails lang={currentLang} />} />
                <Route path="/edit-product/:id" element={<EditProduct lang={currentLang} />} />
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
