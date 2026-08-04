// ============================================
// EntreSkillHub - Loader Components
// ============================================

import React from 'react';

// ============================================
// Full Page Loader
// ============================================
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900">
      <div className="relative">
        {/* Animated Logo */}
        <div className="text-5xl font-bold gradient-text mb-8 animate-pulse-slow">
          🚀 EntreSkillHub
        </div>

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-secondary-500 rounded-full animate-spin"></div>
          </div>
        </div>

        <p className="text-dark-400 mt-6 text-center tracking-widest uppercase text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

// ============================================
// Inline Spinner
// ============================================
export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-primary-500/20 border-t-primary-500',
    white: 'border-white/20 border-t-white',
    dark: 'border-dark-500/20 border-t-dark-700',
  };

  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizes[size]} ${colors[color]}`}
    ></div>
  );
};

// ============================================
// Centered Loader
// ============================================
export const CenteredLoader = ({ message = 'Loading...', size = 'lg' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
      <Spinner size={size} />
      {message && <p className="mt-4 text-dark-500 dark:text-dark-400 text-sm">{message}</p>}
    </div>
  );
};

// ============================================
// Button Loader
// ============================================
export const ButtonLoader = ({ text = 'Loading...' }) => {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size="sm" color="white" />
      <span>{text}</span>
    </span>
  );
};

// ============================================
// Skeleton Loader
// ============================================
export const Skeleton = ({ className = '', count = 1, height = 'h-4' }) => {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`skeleton ${height} ${className}`}></div>
  ));
};

// ============================================
// Card Skeleton
// ============================================
export const CardSkeleton = () => {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton h-48 w-full"></div>
      <div className="space-y-2">
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="skeleton h-8 w-24 rounded-full"></div>
        <div className="skeleton h-8 w-20 rounded-lg"></div>
      </div>
    </div>
  );
};

// ============================================
// Grid Skeleton
// ============================================
export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

// ============================================
// Dots Loader
// ============================================
export const DotsLoader = ({ color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    dark: 'bg-dark-500',
  };

  return (
    <div className="flex items-center gap-1.5">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full animate-bounce ${colors[color]}`}
          style={{ animationDelay: `${delay}s` }}
        ></div>
      ))}
    </div>
  );
};

// ============================================
// Progress Loader (with percentage)
// ============================================
export const ProgressLoader = ({ progress = 0, message = 'Loading...' }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-dark-700 dark:text-dark-200">
          {message}
        </span>
        <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill bg-gradient-to-r from-primary-500 to-secondary-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Default export
export default PageLoader;