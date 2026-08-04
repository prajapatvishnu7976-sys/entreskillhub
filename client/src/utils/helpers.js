// ============================================
// EntreSkillHub - Helper Functions
// Utility functions used across the app
// ============================================

import { CURRENCY } from './constants';

// ============================================
// Currency & Number Formatting
// ============================================
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '-';

  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
};

export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined) return '-';
  if (amount >= 10000000) return `${CURRENCY.SYMBOL}${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(1)}K`;
  return `${CURRENCY.SYMBOL}${amount}`;
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatNumberShort = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatInvestmentRange = (min, max) => {
  if (min === 0 && max === 0) return 'Free';
  if (min === max) return formatCurrencyShort(min);
  return `${formatCurrencyShort(min)} - ${formatCurrencyShort(max)}`;
};

// ============================================
// Date & Time Formatting
// ============================================
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getRelativeTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
};

export const getDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getTimeAgo = (date) => getRelativeTime(date);

// ============================================
// String Utilities
// ============================================
export const truncate = (str, length = 100, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const titleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

export const highlightText = (text, query) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// ============================================
// Text Formatting
// ============================================
export const formatRole = (role) => {
  const roles = {
    user: 'User',
    mentor: 'Mentor',
    admin: 'Administrator',
    superadmin: 'Super Administrator',
  };
  return roles[role] || capitalize(role);
};

export const formatEnumValue = (value) => {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};

// ============================================
// Validation Helpers
// ============================================
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const isValidPhone = (phone) => {
  const re = /^[+]?[\d\s()-]{10,15}$/;
  return re.test(phone);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const strengths = [
    { score: 0, label: 'Very Weak', color: 'bg-red-500' },
    { score: 1, label: 'Weak', color: 'bg-orange-500' },
    { score: 2, label: 'Fair', color: 'bg-yellow-500' },
    { score: 3, label: 'Good', color: 'bg-blue-500' },
    { score: 4, label: 'Strong', color: 'bg-green-500' },
    { score: 5, label: 'Very Strong', color: 'bg-emerald-500' },
    { score: 6, label: 'Excellent', color: 'bg-emerald-600' },
  ];

  return strengths[score] || strengths[0];
};

// ============================================
// Array Utilities
// ============================================
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const value = item[key];
    if (!result[value]) result[value] = [];
    result[value].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ============================================
// URL Helpers
// ============================================
export const buildUrl = (baseUrl, params) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.pathname + url.search;
};

export const getQueryParams = () => {
  return Object.fromEntries(new URLSearchParams(window.location.search));
};

// ============================================
// Local Storage Helpers
// ============================================
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

// ============================================
// Copy to Clipboard
// ============================================
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// File Helpers
// ============================================
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

// ============================================
// Color Helpers
// ============================================
export const getColorForRating = (rating) => {
  if (rating >= 4.5) return 'text-emerald-500';
  if (rating >= 4) return 'text-green-500';
  if (rating >= 3) return 'text-yellow-500';
  if (rating >= 2) return 'text-orange-500';
  return 'text-red-500';
};

export const getColorForStatus = (status) => {
  const colors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    draft: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    confirmed: 'bg-purple-500',
  };
  return colors[status] || 'bg-gray-500';
};

// ============================================
// Rating Helpers
// ============================================
export const renderStars = (rating, maxStars = 5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) stars.push('full');
  if (hasHalfStar) stars.push('half');
  while (stars.length < maxStars) stars.push('empty');

  return stars;
};

// ============================================
// Debounce & Throttle
// ============================================
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// Scroll Helpers
// ============================================
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
};

export const scrollToElement = (id, offset = 80) => {
  const element = document.getElementById(id);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

// ============================================
// Random Utilities
// ============================================
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomColor = () => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500',
    'bg-green-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ============================================
// Share Helpers
// ============================================
export const shareContent = async ({ title, text, url }) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return copyToClipboard(url);
};