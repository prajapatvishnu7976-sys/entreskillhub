// ============================================
// EntreSkillHub - Admin Service
// ============================================

import api from './api';

const adminService = {
  // Dashboard & Analytics
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  getStats: () => api.get('/admin/stats'),
  getActivityLogs: (params = {}) => api.get('/admin/activity-logs', { params }),

  // User Management
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  banUser: (userId, data) => api.put(`/admin/users/${userId}/ban`, data),
  changeUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  bulkUserAction: (data) => api.post('/admin/users/bulk-action', data),

  // Content Moderation
  getPendingContent: () => api.get('/admin/content/pending'),
  getReportedContent: () => api.get('/admin/content/reported'),
  toggleFeatureContent: (type, id, data) => api.put(`/admin/content/${type}/${id}/feature`, data),

  // Notifications
  sendBulkNotification: (data) => api.post('/admin/notifications/send', data),

  // Mentor Approvals
  getPendingMentors: (params = {}) => api.get('/mentors/admin/pending', { params }),
  verifyMentor: (id, data) => api.put(`/mentors/${id}/verify`, data),

  // Business Idea Approvals
  getPendingBusinessIdeas: (params = {}) => api.get('/business-ideas/admin/pending', { params }),
  reviewBusinessIdea: (id, data) => api.put(`/business-ideas/${id}/review`, data),
};

export default adminService;