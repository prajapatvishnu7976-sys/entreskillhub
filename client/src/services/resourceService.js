// ============================================
// EntreSkillHub - Resource Service
// ============================================

import api from './api';

const resourceService = {
  getAll: (params = {}) => api.get('/resources', { params }),
  getById: (identifier) => api.get(`/resources/${identifier}`),
  getByType: (type, params = {}) => api.get(`/resources/type/${type}`, { params }),
  getByCategory: (category, params = {}) =>
    api.get(`/resources/category/${encodeURIComponent(category)}`, { params }),
  getFeatured: (limit = 10) => api.get('/resources/featured', { params: { limit } }),
  getTrending: (limit = 10) => api.get('/resources/trending', { params: { limit } }),
  getFree: (limit = 20) => api.get('/resources/free', { params: { limit } }),

  review: (id, data) => api.post(`/resources/${id}/review`, data),
  addComment: (id, data) => api.post(`/resources/${id}/comment`, data),
  markCompleted: (id) => api.post(`/resources/${id}/complete`),
  report: (id, data) => api.post(`/resources/${id}/report`, data),
};

export default resourceService;