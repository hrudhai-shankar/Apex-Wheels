import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Key, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  });

  const [showAdminField, setShowAdminField] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, adminSecret } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const signupPayload = {
        name,
        email,
        password,
      };

      if (showAdminField && adminSecret) {
        signupPayload.adminSecret = adminSecret;
      }

      await register(signupPayload);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page container animate-fade-in">
      <div className="register-card card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Register to search, rent, and manage premium vehicles</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
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
                placeholder="Must be at least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .register-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 140px);
          padding: 2rem 1.5rem;
        }
        .register-card {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          background-color: var(--bg-white);
        }
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .register-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .register-header p {
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
        .admin-toggle-section {
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background-color: var(--bg-light);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border);
        }
        .admin-toggle-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .admin-toggle-btn:hover {
          color: var(--primary);
        }
        .admin-field-group {
          margin-top: 0.75rem;
          margin-bottom: 0;
        }
        .register-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.95rem;
        }
        .register-footer a {
          color: var(--primary);
          font-weight: 600;
          transition: var(--transition-fast);
        }
        .register-footer a:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default Register;
