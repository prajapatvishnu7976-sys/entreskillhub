// ============================================
// EntreSkillHub - Auth Context
// Authentication state management
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('esh-token'));

  // ============================================
  // Load user on mount or token change
  // ============================================
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('esh-token');

    if (!storedToken) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      const response = await api.get('/auth/me');

      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to load user');
      }
    } catch (error) {
      console.error('Auth load error:', error);
      localStorage.removeItem('esh-token');
      localStorage.removeItem('esh-refresh-token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ============================================
  // Register
  // ============================================
  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data.tokens;

        localStorage.setItem('esh-token', accessToken);
        localStorage.setItem('esh-refresh-token', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        setToken(accessToken);
        setUser(response.data.data.user);
        setIsAuthenticated(true);

        toast.success('🎉 ' + response.data.message);
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      const errors = error.response?.data?.errors || [];
      toast.error(message);
      return { success: false, message, errors };
    }
  }, []);

  // ============================================
  // Login
  // ============================================
  const login = useCallback(async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data.tokens;

        localStorage.setItem('esh-token', accessToken);
        localStorage.setItem('esh-refresh-token', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        setToken(accessToken);
        setUser(response.data.data.user);
        setIsAuthenticated(true);

        toast.success('👋 ' + response.data.message);
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ============================================
  // Logout
  // ============================================
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('esh-token');
      localStorage.removeItem('esh-refresh-token');
      delete api.defaults.headers.common['Authorization'];

      setUser(null);
      setIsAuthenticated(false);
      setToken(null);

      toast.success('Logged out successfully!');
    }
  }, []);

  // ============================================
  // Forgot Password
  // ============================================
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ============================================
  // Reset Password
  // ============================================
  const resetPassword = useCallback(async (token, passwords) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, passwords);

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data.tokens;
        localStorage.setItem('esh-token', accessToken);
        localStorage.setItem('esh-refresh-token', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        setToken(accessToken);
        setUser(response.data.data.user);
        setIsAuthenticated(true);

        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ============================================
  // Update User Data (local state)
  // ============================================
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  // ============================================
  // Refresh Token
  // ============================================
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('esh-refresh-token');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await api.post('/auth/refresh-token', { refreshToken });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefresh } = response.data.data;
        localStorage.setItem('esh-token', accessToken);
        localStorage.setItem('esh-refresh-token', newRefresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setToken(accessToken);
        return true;
      }
    } catch (error) {
      await logout();
      return false;
    }
  }, [logout]);

  // ============================================
  // Role Checks
  // ============================================
  const isAdmin = useMemo(() => {
    return user && ['admin', 'superadmin'].includes(user.role);
  }, [user]);

  const isMentor = useMemo(() => {
    return user && user.role === 'mentor';
  }, [user]);

  const isUser = useMemo(() => {
    return user && user.role === 'user';
  }, [user]);

  const hasRole = useCallback(
    (...roles) => {
      return user && roles.includes(user.role);
    },
    [user]
  );

  // ============================================
  // Context Value
  // ============================================
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      isMentor,
      isUser,
      hasRole,
      register,
      login,
      logout,
      forgotPassword,
      resetPassword,
      updateUser,
      refreshAccessToken,
      loadUser,
    }),
    [
      user, token, loading, isAuthenticated, isAdmin, isMentor, isUser,
      hasRole, register, login, logout, forgotPassword, resetPassword,
      updateUser, refreshAccessToken, loadUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;