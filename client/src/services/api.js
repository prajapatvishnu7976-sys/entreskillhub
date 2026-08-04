// ============================================
// EntreSkillHub - Axios API Configuration
// Central HTTP client with interceptors
// ============================================

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('esh-token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('esh-refresh-token');

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefresh } = response.data.data;

            localStorage.setItem('esh-token', accessToken);
            localStorage.setItem('esh-refresh-token', newRefresh);

            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('esh-token');
        localStorage.removeItem('esh-refresh-token');
        delete api.defaults.headers.common['Authorization'];

        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }

    // Handle 429 - Rate limited
    if (error.response?.status === 429) {
      console.warn('Rate limited. Please slow down.');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;