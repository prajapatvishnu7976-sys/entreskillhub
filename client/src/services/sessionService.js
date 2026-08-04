// ============================================
// EntreSkillHub - Session Service
// ============================================

import api from './api';

const sessionService = {
  book: (data) => api.post('/sessions/book', data),
  getUpcoming: (params = {}) => api.get('/sessions/upcoming', { params }),
  getPast: (params = {}) => api.get('/sessions/past', { params }),
  getMy: (params = {}) => api.get('/sessions/my', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  confirm: (id, data) => api.put(`/sessions/${id}/confirm`, data),
  cancel: (id, data) => api.put(`/sessions/${id}/cancel`, data),
  reschedule: (id, data) => api.put(`/sessions/${id}/reschedule`, data),
  start: (id) => api.put(`/sessions/${id}/start`),
  complete: (id, data) => api.put(`/sessions/${id}/complete`, data),
  addNotes: (id, data) => api.put(`/sessions/${id}/notes`, data),
  addMessage: (id, data) => api.post(`/sessions/${id}/messages`, data),
  submitMenteeReview: (id, data) => api.post(`/sessions/${id}/review/mentee`, data),
  submitMentorReview: (id, data) => api.post(`/sessions/${id}/review/mentor`, data),
  getMentorSchedule: (params = {}) => api.get('/sessions/mentor/schedule', { params }),
};

export default sessionService;