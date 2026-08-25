import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-light)', borderRadius: '50%', marginBottom: '12px' }}>
            <Sparkles size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{ fontSize: '1.8rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Log in to manage your KarigarAI artisan products</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="artisan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : <> <LogIn size={18} /> Log In </>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an artisan account?{' '}
          <Link to="/register" style={{ fontWeight: '600' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};
