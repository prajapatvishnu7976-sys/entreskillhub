// ============================================
// EntreSkillHub - User Service
// ============================================

import api from './api';

const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (formData) =>
    api.put('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProfileImage: () => api.delete('/users/profile/image'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  addSkills: (data) => api.post('/users/skills', data),
  removeSkill: (skillId) => api.delete(`/users/skills/${skillId}`),
  updateInterests: (data) => api.put('/users/interests', data),
  getSavedBusinesses: () => api.get('/users/saved-businesses'),
  toggleSaveBusiness: (businessId) => api.post(`/users/save-business/${businessId}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getActivity: () => api.get('/users/activity'),
  getLoginHistory: () => api.get('/users/login-history'),
  getReferralInfo: () => api.get('/users/referral'),
  searchUsers: (params = {}) => api.get('/users/search', { params }),
  deleteAccount: (data) => api.delete('/users/account', { data }),
};

export default userService;