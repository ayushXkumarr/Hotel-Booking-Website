import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * Authentication Provider
 * Manages user state, JWT tokens in localStorage, and authentication actions (login, register, logout).
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('grandstay_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize and verify current user on initial application mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('grandstay_token');
      const storedUser = localStorage.getItem('grandstay_user');

      if (storedToken) {
        // Optimistically set cached user to prevent UI flicker
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('grandstay_user');
          }
        }

        try {
          // Verify token authenticity by querying profile endpoint
          const res = await api.get('/auth/profile');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('grandstay_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          // Token expired or invalid
          console.warn('[AuthContext] Session invalid or expired. Resetting session state.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user with email and password
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Save to localStorage
      localStorage.setItem('grandstay_token', receivedToken);
      localStorage.setItem('grandstay_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * Register a new customer
   */
  const register = async ({ name, email, password, phone }) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Save to localStorage
      localStorage.setItem('grandstay_token', receivedToken);
      localStorage.setItem('grandstay_user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Update user profile information
   */
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;

      setUser(updatedUser);
      localStorage.setItem('grandstay_user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update profile.';
      return { success: false, error: message };
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('grandstay_token');
    localStorage.removeItem('grandstay_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
