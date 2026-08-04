// ============================================
// EntreSkillHub - Mentor Detail & Booking Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiStar, FiUsers, FiClock, FiAward, FiCheckCircle, FiCheck,
  FiLinkedin, FiTwitter, FiGlobe, FiMapPin, FiCalendar,
  FiMessageSquare, FiArrowRight, FiHome, FiBriefcase,
  FiBookOpen, FiHeart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader, ButtonLoader } from '../components/common/Loader';
import mentorService from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatNumberShort, getInitials, formatDate, getRelativeTime } from '../utils/helpers';

const MentorDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchMentor();
  }, [identifier]);

  const fetchMentor = async () => {
    try {
      const response = await mentorService.getById(identifier);
      if (response.data.success) {
        setMentor(response.data.data.mentor);
      }
    } catch (error) {
      toast.error('Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) return (
    <>
      <Navbar />
      <CenteredLoader message="Loading mentor profile..." />
    </>
  );

  if (!mentor) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">Mentor Not Found</h1>
          <Link to="/mentors" className="btn-primary">Browse Mentors</Link>
        </div>
      </div>
    </>
  );

  const tabs = [
    { id: 'about', label: 'About', icon: FiBriefcase },
    { id: 'experience', label: 'Experience', icon: FiAward },
    { id: 'reviews', label: `Reviews (${mentor.rating?.total || 0})`, icon: FiStar },
    { id: 'qanda', label: 'Q&A', icon: FiMessageSquare },
  ];

  return (
    <>
      <Helmet>
        <title>{mentor.user?.name} - Mentor - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative pt-8 pb-32 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/" className="hover:text-white"><FiHome className="w-4 h-4" /></Link>
            <span>/</span>
            <Link to="/mentors" className="hover:text-white">Mentors</Link>
            <span>/</span>
            <span className="text-white truncate">{mentor.user?.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {mentor.user?.profileImage?.url ? (
                <img
                  src={mentor.user.profileImage.url}
                  alt={mentor.user.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-5xl font-bold border-4 border-white/30 shadow-2xl">
                  {getInitials(mentor.user?.name)}
                </div>
              )}
              {mentor.availability?.isAvailable && (
                <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {mentor.isTopMentor && (
                  <span className="badge bg-yellow-500 text-white">👑 Top Mentor</span>
                )}
                {mentor.isFeatured && (
                  <span className="badge bg-red-500 text-white">⭐ Featured</span>
                )}
                <span className="badge bg-white/20 backdrop-blur-xl text-white capitalize">
                  {mentor.mentorLevel} Mentor
                </span>
                {mentor.verification?.status === 'verified' && (
                  <span className="badge-success">✓ Verified</span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-2">{mentor.user?.name}</h1>
              <p className="text-xl text-white/90 mb-4">{mentor.title}</p>

              {mentor.tagline && (
                <p className="text-white/80 italic mb-4">"{mentor.tagline}"</p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="font-bold">{mentor.rating?.average?.toFixed(1) || 'N/A'}</span>
                  <span className="text-white/70 text-sm">({mentor.rating?.total || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers className="w-5 h-5" />
                  <span>{mentor.stats?.completedSessions || 0} sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiBriefcase className="w-5 h-5" />
                  <span>{mentor.totalExperience}+ years experience</span>
                </div>
                {mentor.location?.city && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-5 h-5" />
                    <span>{mentor.location.city}, {mentor.location.country}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button onClick={handleBookSession} className="btn bg-white text-primary-600 hover:bg-white/90 btn-lg">
                  <FiCalendar className="w-5 h-5" />
                  Book Session
                </button>
                <button className="btn-glass btn-lg">
                  <FiMessageSquare className="w-5 h-5" />
                  Send Message
                </button>
                <button className="btn-glass btn-icon">
                  <FiHeart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="card-glass p-6 rounded-3xl min-w-[280px]">
              <div className="text-white/70 text-sm mb-2">Starting from</div>
              <div className="text-4xl font-bold text-white mb-1">
                {mentor.pricing?.isFree
                  ? 'FREE'
                  : `₹${mentor.pricing?.sessionRates?.[0]?.price || 'N/A'}`}
              </div>
              <div className="text-white/70 text-sm mb-4">per session</div>

              {mentor.pricing?.firstSessionFree && (
                <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30 mb-4">
                  <div className="text-green-400 text-sm font-bold">🎁 First Session FREE</div>
                </div>
              )}

              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-400" />
                  <span>1-on-1 personalized guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-400" />
                  <span>Flexible scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-green-400" />
                  <span>Post-session support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-dark-50 dark:bg-dark-900 -mt-16 relative z-10">
        <div className="container-custom">
          {/* Tabs */}
          <div className="card p-2 mb-6 flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-4">About</h2>
                    <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">
                      {mentor.professionalBio}
                    </p>
                  </div>

                  {/* Expertise */}
                  <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-4">Areas of Expertise</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {mentor.expertiseCategories?.map((cat, i) => (
                        <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {mentor.expertise?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mentor.expertise.map((exp, i) => (
                          <div key={i} className="p-3 border border-dark-100 dark:border-dark-700 rounded-xl">
                            <div className="font-semibold">{exp.area}</div>
                            <div className="text-sm text-dark-500">
                              {exp.yearsOfExperience}+ years · {exp.proficiencyLevel}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  {mentor.languages?.length > 0 && (
                    <div className="card p-8">
                      <h2 className="text-2xl font-bold mb-4">Languages</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {mentor.languages.map((lang, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-dark-100 dark:border-dark-700 rounded-xl">
                            <span className="font-medium">{lang.language}</span>
                            <span className="text-xs badge-primary capitalize">
                              {lang.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Work Experience */}
                  {mentor.workExperience?.length > 0 && (
                    <div className="card p-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiBriefcase className="w-6 h-6" />
                        Work Experience
                      </h2>
                      <div className="space-y-6">
                        {mentor.workExperience.map((exp, i) => (
                          <div key={i} className="relative pl-8 border-l-2 border-primary-500/30">
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-primary-500 rounded-full"></div>
                            <div className="font-bold text-lg">{exp.position}</div>
                            <div className="text-primary-600">{exp.company}</div>
                            <div className="text-sm text-dark-500 mt-1">
                              {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                            </div>
                            {exp.description && (
                              <p className="mt-2 text-sm text-dark-600 dark:text-dark-300">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {mentor.education?.length > 0 && (
                    <div className="card p-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiBookOpen className="w-6 h-6" />
                        Education
                      </h2>
                      <div className="space-y-4">
                        {mentor.education.map((edu, i) => (
                          <div key={i} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                            <div className="font-bold">{edu.degree}</div>
                            {edu.field && <div className="text-primary-600">{edu.field}</div>}
                            <div className="text-sm text-dark-500 mt-1">
                              {edu.institution} · {edu.yearOfCompletion}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {mentor.certifications?.length > 0 && (
                    <div className="card p-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiAward className="w-6 h-6" />
                        Certifications
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mentor.certifications.map((cert, i) => (
                          <div key={i} className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                            <div className="font-bold text-sm">{cert.name}</div>
                            <div className="text-xs text-dark-500">{cert.issuingOrganization}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Rating Overview */}
                  <div className="card p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold gradient-text mb-2">
                          {mentor.rating?.average?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-6 h-6 ${
                                i < Math.floor(mentor.rating?.average || 0)
                                  ? 'text-yellow-500'
                                  : 'text-dark-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <div className="text-dark-500">
                          Based on {mentor.rating?.total || 0} reviews
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = mentor.rating?.distribution?.[
                            ['one', 'two', 'three', 'four', 'five'][star - 1]
                          ] || 0;
                          const percent = mentor.rating?.total
                            ? (count / mentor.rating.total) * 100
                            : 0;

                          return (
                            <div key={star} className="flex items-center gap-2 text-sm">
                              <span className="w-4">{star}</span>
                              <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
                              <div className="flex-1 h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right text-dark-500">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {mentor.reviews?.length > 0 ? (
                    <div className="space-y-4">
                      {mentor.reviews.slice(0, 5).map((review, i) => (
                        <div key={i} className="card p-6">
                          <div className="flex items-start gap-4">
                            {review.mentee?.profileImage?.url ? (
                              <img
                                src={review.mentee.profileImage.url}
                                alt={review.mentee.name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                                {getInitials(review.mentee?.name)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-bold">{review.mentee?.name || 'Anonymous'}</div>
                                  <div className="text-xs text-dark-500">
                                    {getRelativeTime(review.createdAt)}
                                  </div>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, si) => (
                                    <FiStar
                                      key={si}
                                      className={`w-4 h-4 ${
                                        si < review.rating ? 'text-yellow-500' : 'text-dark-300'
                                      }`}
                                      fill="currentColor"
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.title && (
                                <div className="font-semibold mb-1">{review.title}</div>
                              )}
                              {review.comment && (
                                <p className="text-dark-600 dark:text-dark-300 text-sm">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-12 text-center">
                      <div className="text-6xl mb-4">⭐</div>
                      <h3 className="font-bold mb-2">No reviews yet</h3>
                      <p className="text-dark-500">Be the first to review this mentor!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Q&A Tab */}
              {activeTab === 'qanda' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Questions & Answers</h2>
                  {mentor.qAndA?.filter((q) => q.isPublic)?.length > 0 ? (
                    <div className="space-y-4">
                      {mentor.qAndA.filter((q) => q.isPublic).map((qa, i) => (
                        <div key={i} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                          <div className="font-semibold mb-2 flex items-start gap-2">
                            <span className="text-primary-500">Q:</span>
                            <span>{qa.question}</span>
                          </div>
                          {qa.answer && (
                            <div className="pl-6 mt-2 text-dark-600 dark:text-dark-300 text-sm flex items-start gap-2">
                              <span className="text-success-500 font-bold">A:</span>
                              <span>{qa.answer}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">💬</div>
                      <p className="text-dark-500 mb-4">No questions yet. Ask the mentor!</p>
                      <button className="btn-primary">Ask a Question</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              <div className="card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  Availability
                </h3>
                <div className={`p-3 rounded-xl mb-3 ${mentor.availability?.isAvailable ? 'bg-success-50 dark:bg-success-500/10' : 'bg-danger-50 dark:bg-danger-500/10'}`}>
                  <div className={`text-sm font-bold ${mentor.availability?.isAvailable ? 'text-success-700' : 'text-danger-700'}`}>
                    {mentor.availability?.isAvailable ? '🟢 Available for Booking' : '🔴 Not Available'}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-dark-500">
                  <div>Response time: {mentor.availability?.responseTime?.replace(/_/g, ' ') || 'within 24 hours'}</div>
                  <div>Timezone: {mentor.availability?.timezone || 'Asia/Kolkata'}</div>
                </div>
              </div>

              {/* Social Links */}
              {mentor.socialLinks && Object.values(mentor.socialLinks).some((v) => v) && (
                <div className="card p-6">
                  <h3 className="font-bold mb-4">Connect</h3>
                  <div className="space-y-2">
                    {mentor.socialLinks.linkedin && (
                      <a href={mentor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 text-sm">
                        <FiLinkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {mentor.socialLinks.twitter && (
                      <a href={mentor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 text-sm">
                        <FiTwitter className="w-4 h-4" /> Twitter
                      </a>
                    )}
                    {mentor.socialLinks.website && (
                      <a href={mentor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 text-sm">
                        <FiGlobe className="w-4 h-4" /> Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Simple Booking Modal Placeholder */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay" onClick={() => setShowBookingModal(false)}>
          <div className="card max-w-md w-full m-4 p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-4">Book a Session</h3>
            <p className="text-dark-500 mb-6">
              Full booking calendar coming soon! For now, contact the mentor directly.
            </p>
            <button onClick={() => setShowBookingModal(false)} className="btn-primary w-full">
              Got It
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MentorDetailPage;