// ============================================
// EntreSkillHub - Business Ideas Service
// ============================================

import api from './api';

const businessService = {
  // Get all business ideas with filters
  getAll: (params = {}) => api.get('/business-ideas', { params }),

  // Get single business idea
  getById: (identifier) => api.get(`/business-ideas/${identifier}`),

  // Get featured
  getFeatured: (limit = 10) => api.get('/business-ideas/featured', { params: { limit } }),

  // Get trending
  getTrending: (limit = 10) => api.get('/business-ideas/trending', { params: { limit } }),

  // Get by category
  getByCategory: (category, params = {}) =>
    api.get(`/business-ideas/category/${encodeURIComponent(category)}`, { params }),

  // Get categories
  getCategories: () => api.get('/business-ideas/categories'),

  // Get by investment range
  getByInvestmentRange: (min, max, limit = 20) =>
    api.get('/business-ideas/investment-range', { params: { min, max, limit } }),

  // Get personalized recommendations
  getRecommendations: (params = {}) =>
    api.get('/business-ideas/recommendations', { params }),

  // Get similar ideas
  getSimilar: (id, limit = 5) =>
    api.get(`/business-ideas/${id}/similar`, { params: { limit } }),

  // Rate business idea
  rate: (id, data) => api.post(`/business-ideas/${id}/rate`, data),

  // Share
  share: (id) => api.post(`/business-ideas/${id}/share`),

  // Admin actions
  create: (data) => api.post('/business-ideas', data),
  update: (id, data) => api.put(`/business-ideas/${id}`, data),
  delete: (id) => api.delete(`/business-ideas/${id}`),
  getPending: (params = {}) => api.get('/business-ideas/admin/pending', { params }),
  review: (id, data) => api.put(`/business-ideas/${id}/review`, data),
};

export default businessService;