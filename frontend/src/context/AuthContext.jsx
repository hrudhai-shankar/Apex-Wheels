import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          // Skip API refresh for mock admin bypass tokens
          if (token !== 'mock_admin_token_bypass') {
            const profile = await api.auth.getProfile();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          }
        } catch (err) {
          console.error('Session initialization failed:', err.message);
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('token', data.token);
      
      const userProfile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        plan: data.plan || 'free',
      };
      
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('token', data.token);

      const userProfile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        plan: data.plan || 'free',
      };

      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = (newPlan) => {
    if (user) {
      const updatedUser = { ...user, plan: newPlan };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
