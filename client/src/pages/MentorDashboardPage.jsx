// ============================================
// EntreSkillHub - Mentor Dashboard
// Complete dashboard for mentors
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiCalendar, FiUsers, FiDollarSign, FiTrendingUp, FiStar,
  FiClock, FiAward, FiMessageSquare, FiCheckCircle,
  FiActivity, FiEye, FiArrowRight, FiPlay, FiBookOpen,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader } from '../components/common/Loader';
import { StatCard } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import mentorService from '../services/mentorService';
import { getInitials, formatCurrency, formatDate, formatTime, getRelativeTime } from '../utils/helpers';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingQuestions, setPendingQuestions] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardService.getMentorDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }

      // Fetch pending questions
      const mentorResponse = await mentorService.getMyProfile();
      if (mentorResponse.data.success) {
        const questions = mentorResponse.data.data.mentor.qAndA?.filter((q) => !q.answer) || [];
        setPendingQuestions(questions);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <CenteredLoader message="Loading mentor dashboard..." />
    </>
  );

  const {
    mentor = {},
    quickStats = {},
    rating = {},
    todaySessions = [],
    upcomingSessions = [],
    recentReviews = [],
  } = dashboardData || {};

  return (
    <>
      <Helmet>
        <title>Mentor Dashboard - EntreSkillHub</title>
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
                {mentor.user?.profileImage?.url ? (
                  <img
                    src={mentor.user.profileImage.url}
                    alt={mentor.user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div>
                  <div className="text-white/80 text-sm mb-1">Welcome back, 👋</div>
                  <h1 className="text-3xl font-bold">{mentor.user?.name || user?.name}!</h1>
                  <p className="text-white/80 mt-1 capitalize">
                    {mentor.mentorLevel} Mentor · {mentor.title}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={`/mentors/${mentor.user?._id || ''}`} className="btn-glass">
                  <FiEye className="w-4 h-4" />
                  View Public Profile
                </Link>
                <button className="btn-glass">
                  <FiMessageSquare className="w-4 h-4" />
                  Messages
                </button>
              </div>
            </div>

            {mentor.verification !== 'verified' && (
              <div className="mt-6 p-4 bg-yellow-500/20 backdrop-blur-xl rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <div className="font-bold">Verification Pending</div>
                    <div className="text-sm text-white/90">Your profile is under review. Get verified to start receiving bookings.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={FiUsers}
              label="Total Sessions"
              value={quickStats.totalSessions || 0}
              color="primary"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Completed"
              value={quickStats.completedSessions || 0}
              color="success"
            />
            <StatCard
              icon={FiDollarSign}
              label="Total Earnings"
              value={formatCurrency(quickStats.totalEarnings || 0)}
              color="accent"
            />
            <StatCard
              icon={FiStar}
              label="Rating"
              value={rating.average || 'N/A'}
              color="secondary"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Sessions */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-primary-500" />
                    Today's Sessions ({todaySessions.length})
                  </h2>
                  <Link to="/sessions" className="text-sm text-primary-600 font-semibold">
                    View All →
                  </Link>
                </div>

                {todaySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="font-bold mb-2">No sessions today</h3>
                    <p className="text-sm text-dark-500">Enjoy your free time!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySessions.map((session) => (
                      <div
                        key={session._id}
                        className="p-4 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-500/10 rounded-r-xl"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{session.title}</div>
                            <div className="text-sm text-dark-500 mt-1">
                              with {session.mentee?.name || 'Mentee'}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                              <FiClock className="w-3 h-3" />
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                          <button className="btn-primary btn-sm">
                            <FiPlay className="w-4 h-4" />
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Sessions */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  Upcoming Sessions
                </h2>

                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">📆</div>
                    <p className="text-dark-500">No upcoming sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {session.mentee?.profileImage?.url ? (
                              <img
                                src={session.mentee.profileImage.url}
                                alt=""
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                                {getInitials(session.mentee?.name || 'M')}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{session.title}</div>
                              <div className="text-xs text-dark-500">
                                {formatDate(session.scheduledDate)} · {session.startTime}
                              </div>
                            </div>
                          </div>
                          <span className={`badge ${
                            session.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  Recent Reviews
                </h2>

                {recentReviews.length === 0 ? (
                  <div className="text-center py-8 text-dark-500">
                    <div className="text-5xl mb-4">⭐</div>
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.slice(0, 3).map((review, i) => (
                      <div key={i} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                        <div className="flex items-start gap-3 mb-2">
                          {review.mentee?.profileImage?.url ? (
                            <img src={review.mentee.profileImage.url} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                              {getInitials(review.mentee?.name || 'A')}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{review.mentee?.name || 'Anonymous'}</div>
                              <div className="flex">
                                {[...Array(5)].map((_, si) => (
                                  <FiStar
                                    key={si}
                                    className={`w-4 h-4 ${
                                      si < review.menteeReview?.rating ? 'text-yellow-500' : 'text-dark-300'
                                    }`}
                                    fill="currentColor"
                                  />
                                ))}
                              </div>
                            </div>
                            {review.menteeReview?.comment && (
                              <p className="text-sm text-dark-600 dark:text-dark-300 mt-2">
                                {review.menteeReview.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="card p-6">
                <h3 className="font-bold mb-4">Profile Strength</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-dark-500">Completion</span>
                    <span className="text-sm font-bold text-primary-600">
                      {mentor.profileCompletion || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      style={{ width: `${mentor.profileCompletion || 0}%` }}
                    ></div>
                  </div>
                </div>
                <Link to="/profile" className="btn-outline btn-sm w-full">
                  Update Profile
                </Link>
              </div>

              {/* Earnings Card */}
              <div className="card p-6 bg-gradient-to-br from-success-500 to-emerald-500 text-white">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-sm opacity-90">This Month Earnings</div>
                <div className="text-3xl font-bold mt-1">
                  {formatCurrency(quickStats.monthEarnings || 0)}
                </div>
                <div className="text-sm opacity-90 mt-2">
                  This Week: {formatCurrency(quickStats.weekEarnings || 0)}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/mentor/availability" className="btn-outline w-full">
                    <FiClock className="w-4 h-4" />
                    Set Availability
                  </Link>
                  <Link to="/mentor/resources/create" className="btn-outline w-full">
                    <FiBookOpen className="w-4 h-4" />
                    Add Resource
                  </Link>
                  <Link to="/sessions" className="btn-outline w-full">
                    <FiCalendar className="w-4 h-4" />
                    All Sessions
                  </Link>
                </div>
              </div>

              {/* Pending Questions */}
              {pendingQuestions.length > 0 && (
                <div className="card p-6 border-l-4 border-orange-500">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FiMessageSquare className="w-5 h-5 text-orange-500" />
                    Pending Q&A ({pendingQuestions.length})
                  </h3>
                  <p className="text-sm text-dark-500 mb-3">
                    You have unanswered questions from mentees
                  </p>
                  <button className="btn-outline w-full text-sm">
                    Answer Questions
                  </button>
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

export default MentorDashboardPage;