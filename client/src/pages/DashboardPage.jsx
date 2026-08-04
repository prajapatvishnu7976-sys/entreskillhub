// ============================================
// EntreSkillHub - User Dashboard
// Complete personalized dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiTrendingUp, FiBookmark, FiTarget, FiAward,
  FiCalendar, FiUsers, FiZap, FiClock, FiArrowRight,
  FiCheckCircle, FiActivity,
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BusinessIdeaCard, StatCard } from '../components/common/Card';
import { CenteredLoader, CardSkeleton } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import { getInitials, formatNumberShort, getRelativeTime } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getUserDashboard();
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-50 dark:bg-dark-900 pt-8">
          <CenteredLoader message="Loading your dashboard..." />
        </div>
      </>
    );
  }

  const {
    quickStats = {},
    streak = { current: 0, longest: 0 },
    activeProgress = [],
    upcomingSessions = [],
    recommendedBusinesses = [],
    trendingResources = [],
    recentAchievements = [],
    profileTasks = [],
  } = dashboardData || {};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 pt-8 pb-16">
        <div className="container-custom">
          {/* Welcome Header */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 p-8 text-white">
            <div className="absolute inset-0 bg-grid opacity-10"></div>
            <div className="absolute top-0 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {user?.profileImage?.url ? (
                  <img
                    src={user.profileImage.url}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div>
                  <div className="text-white/80 text-sm mb-1">{greeting()}, 👋</div>
                  <h1 className="text-3xl sm:text-4xl font-bold">{user?.name}!</h1>
                  <p className="text-white/80 mt-2">
                    You're on <span className="font-bold">{streak.current} day streak</span> 🔥
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/skill-assessment" className="btn-glass">
                  <FiTarget className="w-4 h-4" />
                  Take Assessment
                </Link>
                <Link to="/business-ideas" className="btn-glass">
                  <FiZap className="w-4 h-4" />
                  Explore Ideas
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={FiTarget}
              label="Active Roadmaps"
              value={quickStats.inProgress || 0}
              color="primary"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Completed"
              value={quickStats.completed || 0}
              color="success"
            />
            <StatCard
              icon={FiBookmark}
              label="Saved Ideas"
              value={quickStats.savedBusinesses || 0}
              color="accent"
            />
            <StatCard
              icon={FiAward}
              label="Total Points"
              value={formatNumberShort(quickStats.totalPoints || 0)}
              color="secondary"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Progress */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-primary-500" />
                    Continue Learning
                  </h2>
                  <Link to="/dashboard/progress" className="text-sm text-primary-600 font-semibold">
                    View All →
                  </Link>
                </div>

                {activeProgress.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🚀</div>
                    <h3 className="font-bold mb-2">No active roadmaps</h3>
                    <p className="text-sm text-dark-500 mb-4">
                      Start your entrepreneurial journey today!
                    </p>
                    <Link to="/roadmaps" className="btn-primary">
                      Explore Roadmaps
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeProgress.slice(0, 3).map((progress) => (
                      <div
                        key={progress._id}
                        className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl hover:border-primary-500 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-dark-900 dark:text-white">
                              {progress.roadmap?.title || 'Untitled Roadmap'}
                            </h3>
                            <p className="text-sm text-dark-500">
                              Step {progress.currentStep} of {progress.totalSteps}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary-600">
                            {progress.completionPercentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                            style={{ width: `${progress.completionPercentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-dark-400">
                            Last activity: {getRelativeTime(progress.lastActivityAt)}
                          </div>
                          <Link
                            to={`/roadmaps/${progress.roadmap?._id}`}
                            className="btn-primary btn-sm"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Business Ideas */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiZap className="w-5 h-5 text-yellow-500" />
                    Recommended for You
                  </h2>
                  <Link to="/business-ideas" className="text-sm text-primary-600 font-semibold">
                    View All →
                  </Link>
                </div>

                {recommendedBusinesses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-dark-500 mb-4">Complete your profile for personalized ideas!</p>
                    <Link to="/skill-assessment" className="btn-primary btn-sm">
                      Take Assessment
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendedBusinesses.slice(0, 4).map((rec) => (
                      <BusinessIdeaCard
                        key={rec.businessIdea?._id || rec._id}
                        idea={{
                          ...(rec.businessIdea || rec),
                          matchScore: rec.matchScore,
                        }}
                        showScore
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-500" />
                  Complete Your Profile
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-500">Progress</span>
                    <span className="font-bold text-primary-600">
                      {profileTasks.filter((t) => t.completed).length}/{profileTasks.length}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{
                        width: `${(profileTasks.filter((t) => t.completed).length / profileTasks.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {profileTasks.slice(0, 5).map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          task.completed
                            ? 'bg-success-500 text-white'
                            : 'border-2 border-dark-200 dark:border-dark-600'
                        }`}
                      >
                        {task.completed && <FiCheckCircle className="w-3 h-3" />}
                      </div>
                      <span
                        className={
                          task.completed
                            ? 'text-dark-400 line-through'
                            : 'text-dark-700 dark:text-dark-200'
                        }
                      >
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/profile" className="btn-outline btn-sm w-full mt-4">
                  Complete Profile
                </Link>
              </div>

              {/* Streak Card */}
              <div className="card p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">🔥</div>
                  <div>
                    <div className="text-sm opacity-90">Current Streak</div>
                    <div className="text-3xl font-bold">{streak.current} Days</div>
                  </div>
                </div>
                <p className="text-sm opacity-90 mb-3">
                  Longest streak: {streak.longest} days
                </p>
                <div className="text-xs opacity-90">
                  Keep learning daily to maintain your streak!
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-primary-500" />
                  Upcoming Sessions
                </h3>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-dark-500 mb-3">No upcoming sessions</p>
                    <Link to="/mentors" className="btn-primary btn-sm">
                      Book a Session
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 3).map((session) => (
                      <div
                        key={session._id}
                        className="p-3 border border-dark-100 dark:border-dark-700 rounded-lg"
                      >
                        <div className="font-medium text-sm truncate">{session.title}</div>
                        <div className="text-xs text-dark-500 mt-1 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(session.scheduledDate).toLocaleDateString()} · {session.startTime}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements */}
              {recentAchievements.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-yellow-500" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {recentAchievements.slice(0, 3).map((achievement, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{achievement.name}</div>
                          <div className="text-xs text-dark-500">
                            +{achievement.points} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DashboardPage;