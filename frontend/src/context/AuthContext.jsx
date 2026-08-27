import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('karigar_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('karigar_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('karigar_token');
    const storedUser = localStorage.getItem('karigar_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('karigar_token');
        localStorage.removeItem('karigar_user');
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('karigar_token', data.access_token);
    localStorage.setItem('karigar_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('karigar_token', data.access_token);
    localStorage.setItem('karigar_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('karigar_token');
    localStorage.removeItem('karigar_user');
    localStorage.removeItem('karigar_whatsapp_phone');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
