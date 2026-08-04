// ============================================
// EntreSkillHub - Protected Route Component
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/Loader';

/**
 * ProtectedRoute - Requires user to be authenticated
 * Optionally restrict to specific roles
 */
const ProtectedRoute = ({ children, roles, requireVerified = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, message: 'Please login to continue' }}
        replace
      />
    );
  }

  if (requireVerified && !user?.isEmailVerified) {
    return (
      <Navigate
        to="/verify-email-required"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (roles && Array.isArray(roles) && !roles.includes(user?.role)) {
    return (
      <Navigate
        to="/dashboard"
        state={{
          from: location.pathname,
          error: `Access denied. Required roles: ${roles.join(', ')}`,
        }}
        replace
      />
    );
  }

  return children;
};

/**
 * PublicOnlyRoute - Only accessible when NOT logged in
 * Redirects to dashboard if authenticated
 */
export const PublicOnlyRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;