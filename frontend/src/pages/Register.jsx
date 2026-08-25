import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h2 style={{ fontSize: '1.8rem' }}>Create Artisan Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Join KarigarAI to digitize and sell your handcrafted products</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : <> <UserPlus size={18} /> Create Account </>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
};
