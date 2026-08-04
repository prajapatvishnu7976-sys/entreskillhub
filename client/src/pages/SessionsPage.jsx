// ============================================
// EntreSkillHub - My Sessions Page
// ============================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiCalendar, FiClock, FiVideo, FiUser, FiCheck, FiX, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader } from '../components/common/Loader';
import sessionService from '../services/sessionService';
import { formatDate, formatTime, getRelativeTime, getInitials } from '../utils/helpers';

const SessionsPage = () => {
  const [tab, setTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [tab]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = tab === 'upcoming'
        ? await sessionService.getUpcoming()
        : await sessionService.getPast();

      if (response.data.success) {
        setSessions(response.data.data.sessions);
      }
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;

    try {
      await sessionService.cancel(id, { reason: 'schedule_conflict' });
      toast.success('Session cancelled');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Sessions - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 py-12">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FiCalendar className="w-10 h-10 text-primary-500" />
              My Sessions
            </h1>
            <p className="text-dark-500">Manage your mentoring sessions</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                tab === 'upcoming'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white dark:bg-dark-800 hover:bg-dark-100'
              }`}
            >
              📅 Upcoming
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                tab === 'past'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white dark:bg-dark-800 hover:bg-dark-100'
              }`}
            >
              🕐 Past
            </button>
          </div>

          {loading ? (
            <CenteredLoader />
          ) : sessions.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-8xl mb-6">📅</div>
              <h3 className="text-2xl font-bold mb-3">
                No {tab} sessions
              </h3>
              <p className="text-dark-500 mb-8">
                {tab === 'upcoming'
                  ? 'Book a session with a mentor to get started!'
                  : 'Your session history will appear here'}
              </p>
              {tab === 'upcoming' && (
                <a href="/mentors" className="btn-primary">
                  Find a Mentor
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <div key={session._id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {session.mentor?.user?.profileImage?.url ? (
                        <img
                          src={session.mentor.user.profileImage.url}
                          alt={session.mentor.user.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                          {getInitials(session.mentorUser?.name || 'M')}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${
                            session.status === 'confirmed' ? 'badge-success' :
                            session.status === 'pending' ? 'badge-warning' :
                            session.status === 'completed' ? 'badge-primary' :
                            'badge-danger'
                          }`}>
                            {session.status}
                          </span>
                          <span className="badge-outline text-xs capitalize">
                            {session.sessionType?.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold mb-1">{session.title}</h3>
                        <p className="text-sm text-dark-500 mb-3">
                          with <strong>{session.mentorUser?.name}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(session.scheduledDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {session.startTime} - {session.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiVideo className="w-4 h-4" />
                            <span className="capitalize">{session.mode}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {tab === 'upcoming' && (
                      <div className="flex gap-2">
                        {session.meetingDetails?.meetingLink && (
                          <a
                            href={session.meetingDetails.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary btn-sm"
                          >
                            <FiPlay className="w-4 h-4" />
                            Join
                          </a>
                        )}
                        <button
                          onClick={() => handleCancel(session._id)}
                          className="btn-outline btn-sm text-danger-600"
                        >
                          <FiX className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SessionsPage;