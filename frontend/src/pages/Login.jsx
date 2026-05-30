import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [starKeyword, setStarKeyword] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error on type
    if (error) setError('');
  };

  const handleStarLogin = () => {
    if (starKeyword === 'STAR') {
      // Create a mock admin user object to bypass backend
      const adminUser = {
        _id: 'admin_bypass_id',
        name: 'System Admin',
        email: 'admin@apexwheels.com',
        role: 'admin',
        plan: 'pro'
      };
      localStorage.setItem('token', 'mock_admin_token_bypass');
      localStorage.setItem('user', JSON.stringify(adminUser));
      window.location.href = '/admin'; // Force full reload so AuthContext picks up the new localStorage value
    } else {
      setError('Invalid admin keyword');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container animate-fade-in">
      <div className="login-card card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to book your next ride with Apex Wheels</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password" /* Hack to prevent Chrome autofill */
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password" /* Hack to prevent Chrome autofill */
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
        
        <div className="admin-bypass-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>Admin Access</p>
          <div className="input-with-icon" style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              className="form-input"
              placeholder="Enter Admin Keyword"
              value={starKeyword}
              onChange={(e) => setStarKeyword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" onClick={handleStarLogin} className="btn btn-secondary">
              Go
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 140px);
          padding: 2rem 1.5rem;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          background-color: var(--bg-white);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .form-input {
          padding-left: 2.75rem;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.95rem;
        }
        .login-footer a {
          color: var(--primary);
          font-weight: 600;
          transition: var(--transition-fast);
        }
        .login-footer a:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default Login;
