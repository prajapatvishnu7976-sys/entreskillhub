// ============================================
// EntreSkillHub - Admin Panel
// Complete admin dashboard with all features
// ============================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FiUsers, FiBriefcase, FiBookOpen, FiTrendingUp, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiEye, FiEdit2, FiTrash2, FiMoreVertical,
  FiSettings, FiBarChart, FiActivity, FiDollarSign, FiClock,
  FiSearch, FiFilter, FiRefreshCw, FiSend, FiShield, FiHome,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import { CenteredLoader } from '../components/common/Loader';
import { StatCard } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { formatNumberShort, formatCurrencyShort, getRelativeTime, getInitials } from '../utils/helpers';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, color: 'text-primary-600' },
    { id: 'users', label: 'Users', icon: FiUsers, color: 'text-blue-600' },
    { id: 'business-ideas', label: 'Business Ideas', icon: FiBriefcase, color: 'text-purple-600' },
    { id: 'mentors', label: 'Mentors', icon: FiShield, color: 'text-green-600' },
    { id: 'content', label: 'Content Moderation', icon: FiBookOpen, color: 'text-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart, color: 'text-pink-600' },
    { id: 'notifications', label: 'Notifications', icon: FiSend, color: 'text-cyan-600' },
    { id: 'activity', label: 'Activity Logs', icon: FiActivity, color: 'text-yellow-600' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Panel - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 pt-8 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <FiShield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-dark-500">Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="card p-3 lg:sticky lg:top-24">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeSection === 'dashboard' && (
                <DashboardSection data={dashboardData} loading={loading} />
              )}
              {activeSection === 'users' && <UsersSection />}
              {activeSection === 'business-ideas' && <BusinessIdeasSection />}
              {activeSection === 'mentors' && <MentorsSection />}
              {activeSection === 'content' && <ContentSection />}
              {activeSection === 'analytics' && <AnalyticsSection />}
              {activeSection === 'notifications' && <NotificationsSection />}
              {activeSection === 'activity' && <ActivitySection />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// Dashboard Section
// ============================================
const DashboardSection = ({ data, loading }) => {
  if (loading) return <CenteredLoader message="Loading admin dashboard..." />;
  if (!data) return null;

  const { overview = {}, growth = {}, pending = {}, activity = {} } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FiUsers}
          label="Total Users"
          value={formatNumberShort(overview.totalUsers || 0)}
          color="primary"
          change={growth.userGrowthPercent}
          trend={growth.userGrowthPercent >= 0 ? 'up' : 'down'}
        />
        <StatCard
          icon={FiShield}
          label="Verified Mentors"
          value={formatNumberShort(overview.totalMentors || 0)}
          color="success"
        />
        <StatCard
          icon={FiBriefcase}
          label="Business Ideas"
          value={formatNumberShort(overview.totalBusinessIdeas || 0)}
          color="secondary"
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={formatCurrencyShort(overview.totalRevenue || 0)}
          color="accent"
        />
      </div>

      {/* Pending Approvals Alert */}
      {pending.total > 0 && (
        <div className="card p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-bold">Pending Approvals</h3>
            <span className="badge bg-orange-500 text-white">{pending.total}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-dark-800 rounded-xl">
              <div className="text-sm text-dark-500 mb-1">Mentor Applications</div>
              <div className="text-2xl font-bold">{pending.mentors}</div>
            </div>
            <div className="p-4 bg-white dark:bg-dark-800 rounded-xl">
              <div className="text-sm text-dark-500 mb-1">Business Ideas</div>
              <div className="text-2xl font-bold">{pending.businessIdeas}</div>
            </div>
            <div className="p-4 bg-white dark:bg-dark-800 rounded-xl">
              <div className="text-sm text-dark-500 mb-1">Resources</div>
              <div className="text-2xl font-bold">{pending.resources}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-sm text-dark-500">Today</div>
          </div>
          <div className="text-3xl font-bold mb-1">{growth.newUsersToday || 0}</div>
          <div className="text-sm text-dark-500">New signups</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
              <FiActivity className="w-5 h-5 text-success-500" />
            </div>
            <div className="text-sm text-dark-500">This Week</div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatNumberShort(activity.activeUsersLastWeek || 0)}
          </div>
          <div className="text-sm text-dark-500">Active users</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-accent-500" />
            </div>
            <div className="text-sm text-dark-500">Completed</div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatNumberShort(activity.completedSessions || 0)}
          </div>
          <div className="text-sm text-dark-500">Total sessions</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Users Section
// ============================================
const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [search, role, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.q = search;
      if (role) params.role = role;

      const response = await adminService.getAllUsers(params);
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId, isBanned) => {
    const confirmed = window.confirm(
      isBanned ? 'Are you sure to unban this user?' : 'Are you sure to ban this user?'
    );
    if (!confirmed) return;

    try {
      await adminService.banUser(userId, { isBanned: !isBanned, reason: isBanned ? '' : 'Policy violation' });
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">User Management</h2>
          <button onClick={fetchUsers} className="btn-outline btn-sm">
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email..."
              className="input pl-12"
            />
          </div>
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input">
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <CenteredLoader />
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-dark-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 dark:border-dark-700">
                  <th className="text-left p-3 text-sm font-semibold">User</th>
                  <th className="text-left p-3 text-sm font-semibold">Role</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-sm font-semibold">Joined</th>
                  <th className="text-right p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-dark-100 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {u.profileImage?.url ? (
                          <img src={u.profileImage.url} alt={u.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-dark-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`badge ${
                        u.role === 'admin' || u.role === 'superadmin'
                          ? 'bg-red-100 text-red-700'
                          : u.role === 'mentor'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.isBanned ? (
                        <span className="badge-danger">Banned</span>
                      ) : u.isActive ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-warning">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-dark-500">{getRelativeTime(u.createdAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleBan(u._id, u.isBanned)}
                        disabled={u.role === 'admin' || u.role === 'superadmin'}
                        className={`btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'} disabled:opacity-30`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-outline btn-sm disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm px-4">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-outline btn-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Business Ideas Section
// ============================================
const BusinessIdeasSection = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await adminService.getPendingBusinessIdeas();
      if (response.data.success) {
        setPending(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load pending ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await adminService.reviewBusinessIdea(id, { status });
      toast.success(`Business idea ${status}`);
      fetchPending();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Pending Business Ideas</h2>

        {loading ? (
          <CenteredLoader />
        ) : pending.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-bold mb-2">All caught up!</h3>
            <p className="text-dark-500">No pending business ideas for review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((idea) => (
              <div key={idea._id} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{idea.title}</h3>
                    <p className="text-sm text-dark-500 mb-2 line-clamp-2">{idea.description}</p>
                    <div className="flex items-center gap-3 text-xs text-dark-500">
                      <span>By {idea.createdBy?.name}</span>
                      <span>·</span>
                      <span>{getRelativeTime(idea.createdAt)}</span>
                      <span>·</span>
                      <span className="badge-primary">{idea.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(idea._id, 'approved')} className="btn-success btn-sm">
                      <FiCheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReview(idea._id, 'rejected')} className="btn-danger btn-sm">
                      <FiXCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Mentors Section
// ============================================
const MentorsSection = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await adminService.getPendingMentors();
      if (response.data.success) {
        setPending(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load pending mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, reason = '') => {
    try {
      await adminService.verifyMentor(id, { status, rejectionReason: reason });
      toast.success(`Mentor ${status}`);
      fetchPending();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Pending Mentor Applications</h2>

        {loading ? (
          <CenteredLoader />
        ) : pending.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-bold mb-2">All caught up!</h3>
            <p className="text-dark-500">No pending mentor applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((mentor) => (
              <div key={mentor._id} className="p-6 border border-dark-100 dark:border-dark-700 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {getInitials(mentor.user?.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{mentor.user?.name}</h3>
                    <p className="text-primary-600 mb-2">{mentor.title}</p>
                    <p className="text-sm text-dark-500 mb-3 line-clamp-2">{mentor.professionalBio}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {mentor.expertiseCategories?.slice(0, 3).map((cat) => (
                        <span key={cat} className="badge-primary text-xs">{cat}</span>
                      ))}
                    </div>
                    <div className="text-xs text-dark-500">
                      Applied {getRelativeTime(mentor.createdAt)} · {mentor.totalExperience}+ years experience
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleVerify(mentor._id, 'verified')}
                      className="btn-success btn-sm"
                    >
                      <FiCheckCircle className="w-4 h-4" /> Verify
                    </button>
                    <button
                      onClick={() => handleVerify(mentor._id, 'rejected', 'Incomplete profile')}
                      className="btn-danger btn-sm"
                    >
                      <FiXCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Other Sections (Placeholders)
// ============================================
const ContentSection = () => (
  <div className="card p-12 text-center animate-fade-in">
    <div className="text-6xl mb-4">🛡️</div>
    <h2 className="text-2xl font-bold mb-2">Content Moderation</h2>
    <p className="text-dark-500">Review reported content and moderate community activity</p>
  </div>
);

const AnalyticsSection = () => (
  <div className="card p-12 text-center animate-fade-in">
    <div className="text-6xl mb-4">📊</div>
    <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
    <p className="text-dark-500">Detailed charts and platform insights coming soon</p>
  </div>
);

const NotificationsSection = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !message) return toast.error('Please fill all fields');

    setSending(true);
    try {
      await adminService.sendBulkNotification({
        targetUsers: target,
        subject,
        message,
      });
      toast.success('Notifications sent successfully!');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Send Bulk Notification</h2>

      <div className="space-y-4">
        <div>
          <label className="label">Target Audience</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="input">
            <option value="all">All Users</option>
            <option value="users">Regular Users</option>
            <option value="mentors">Mentors</option>
          </select>
        </div>

        <div>
          <label className="label">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Notification subject"
            className="input"
          />
        </div>

        <div>
          <label className="label">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            rows="6"
            className="textarea"
          ></textarea>
        </div>

        <button onClick={handleSend} disabled={sending} className="btn-primary w-full">
          <FiSend className="w-4 h-4" />
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>
    </div>
  );
};

const ActivitySection = () => {
  const [logs, setLogs] = useState({ recentUsers: [], recentSessions: [], recentContent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await adminService.getActivityLogs();
        if (response.data.success) setLogs(response.data.data);
      } catch (error) {
        toast.error('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <CenteredLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6">
        <h3 className="font-bold mb-4">Recent User Signups</h3>
        <div className="space-y-2">
          {logs.recentUsers.slice(0, 10).map((u) => (
            <div key={u._id} className="flex items-center justify-between p-3 border border-dark-100 dark:border-dark-700 rounded-lg">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-dark-500">{u.email}</div>
              </div>
              <div className="text-xs text-dark-500">{getRelativeTime(u.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;