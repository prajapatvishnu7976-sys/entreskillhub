// ============================================
// EntreSkillHub - Dashboard Service
// ============================================

import api from './api';

const dashboardService = {
  getUserDashboard: () => api.get('/dashboard/user'),
  getMentorDashboard: () => api.get('/dashboard/mentor'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
  getRecommendations: () => api.get('/dashboard/recommendations'),
  getPlatformStats: () => api.get('/dashboard/platform-stats'),
};

export default dashboardService;