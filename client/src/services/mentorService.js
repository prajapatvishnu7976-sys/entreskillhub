// ============================================
// EntreSkillHub - Mentor Service
// ============================================

import api from './api';

const mentorService = {
  getAll: (params = {}) => api.get('/mentors', { params }),
  getById: (identifier) => api.get(`/mentors/${identifier}`),
  getTop: (limit = 10) => api.get('/mentors/top', { params: { limit } }),
  getFeatured: (limit = 10) => api.get('/mentors/featured', { params: { limit } }),
  getByCategory: (category, params = {}) =>
    api.get(`/mentors/category/${encodeURIComponent(category)}`, { params }),

  // Mentor actions
  register: (data) => api.post('/mentors/register', data),
  getMyProfile: () => api.get('/mentors/profile/me'),
  updateProfile: (data) => api.put('/mentors/profile', data),
  updateAvailability: (data) => api.put('/mentors/availability', data),
  uploadDocuments: (formData) =>
    api.post('/mentors/verification/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyStats: () => api.get('/mentors/stats/me'),
  getMyMentees: () => api.get('/mentors/mentees/me'),
  answerQuestion: (questionId, data) => api.post(`/mentors/questions/${questionId}/answer`, data),

  // User actions
  askQuestion: (id, data) => api.post(`/mentors/${id}/ask`, data),
  getQuestions: (id) => api.get(`/mentors/${id}/questions`),
};

export default mentorService;