// ============================================
// EntreSkillHub - Feedback Service
// ============================================

import api from './api';

const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  getMy: (params = {}) => api.get('/feedback/my', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  getTestimonials: (limit = 10) => api.get('/feedback/testimonials', { params: { limit } }),
  getFeatureRequests: (params = {}) => api.get('/feedback/feature-requests', { params }),
  vote: (id, data) => api.post(`/feedback/${id}/vote`, data),
  submitSatisfaction: (id, data) => api.post(`/feedback/${id}/satisfaction`, data),
};

export default feedbackService;