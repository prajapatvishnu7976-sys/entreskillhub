// ============================================
// EntreSkillHub - Skills Service
// ============================================

import api from './api';

const skillService = {
  getAll: (params = {}) => api.get('/skills', { params }),
  getById: (identifier) => api.get(`/skills/${identifier}`),
  getFeatured: (limit = 10) => api.get('/skills/featured', { params: { limit } }),
  getTrending: (limit = 10) => api.get('/skills/trending', { params: { limit } }),
  getCategories: () => api.get('/skills/categories'),
  getByCategory: (category, params = {}) =>
    api.get(`/skills/category/${encodeURIComponent(category)}`, { params }),
  getStats: () => api.get('/skills/stats'),
  getRecommendations: () => api.get('/skills/recommendations'),
  rate: (id, data) => api.post(`/skills/${id}/rate`, data),
};

export default skillService;