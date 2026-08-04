// ============================================
// EntreSkillHub - Roadmap Service
// ============================================

import api from './api';

const roadmapService = {
  getAll: (params = {}) => api.get('/roadmaps', { params }),
  getById: (identifier) => api.get(`/roadmaps/${identifier}`),
  getFeatured: (limit = 10) => api.get('/roadmaps/featured', { params: { limit } }),
  getPopular: (limit = 10) => api.get('/roadmaps/popular', { params: { limit } }),
  getByBusiness: (businessId) => api.get(`/roadmaps/business/${businessId}`),
  getMy: (params = {}) => api.get('/roadmaps/my/roadmaps', { params }),

  enroll: (id) => api.post(`/roadmaps/${id}/enroll`),
  rate: (id, data) => api.post(`/roadmaps/${id}/rate`, data),
  getStep: (id, stepNumber) => api.get(`/roadmaps/${id}/steps/${stepNumber}`),
  updateStepProgress: (id, stepNumber, data) =>
    api.put(`/roadmaps/${id}/steps/${stepNumber}/progress`, data),
  completeTask: (id, stepNumber, taskId, data) =>
    api.post(`/roadmaps/${id}/steps/${stepNumber}/tasks/${taskId}/complete`, data),
};

export default roadmapService;