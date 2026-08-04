// ============================================
// EntreSkillHub - Roadmap Detail Page
// Step-by-step roadmap with progress tracking
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiCheck, FiClock, FiTarget, FiTrendingUp, FiDollarSign,
  FiUsers, FiStar, FiArrowRight, FiArrowLeft, FiCheckCircle,
  FiCircle, FiLock, FiPlay, FiAward, FiHome, FiZap,
  FiChevronDown, FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader, ButtonLoader } from '../components/common/Loader';
import roadmapService from '../services/roadmapService';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyShort, formatNumberShort } from '../utils/helpers';

const RoadmapDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRoadmap();
  }, [identifier]);

  const fetchRoadmap = async () => {
    try {
      const response = await roadmapService.getById(identifier);
      if (response.data.success) {
        setRoadmap(response.data.data.roadmap);
        setIsEnrolled(response.data.data.isEnrolled);
        setUserProgress(response.data.data.userProgress);
      }
    } catch (error) {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await roadmapService.enroll(roadmap._id);
      if (response.data.success) {
        toast.success('🎉 Successfully enrolled!');
        setIsEnrolled(true);
        setUserProgress({
          status: 'enrolled',
          currentStep: 1,
          completedSteps: 0,
          completionPercentage: 0,
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Already enrolled in this roadmap');
      } else {
        toast.error('Failed to enroll');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleStepAction = async (stepNumber, status) => {
    if (!isEnrolled) {
      toast.error('Please enroll first');
      return;
    }

    try {
      const response = await roadmapService.updateStepProgress(roadmap._id, stepNumber, { status });
      if (response.data.success) {
        toast.success(`Step ${status === 'completed' ? 'completed!' : 'updated'}`);
        setUserProgress(response.data.data.progress);
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <CenteredLoader message="Loading roadmap..." />
    </>
  );

  if (!roadmap) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">Roadmap Not Found</h1>
          <Link to="/roadmaps" className="btn-primary">Browse Roadmaps</Link>
        </div>
      </div>
    </>
  );

  const getStepStatus = (stepNumber) => {
    if (!userProgress) return 'not_started';
    if (stepNumber < userProgress.currentStep) return 'completed';
    if (stepNumber === userProgress.currentStep) return 'in_progress';
    return 'not_started';
  };

  const phaseColors = {
    idea_validation: 'from-blue-500 to-cyan-500',
    planning: 'from-purple-500 to-pink-500',
    skill_building: 'from-orange-500 to-red-500',
    legal_setup: 'from-green-500 to-emerald-500',
    financial_setup: 'from-yellow-500 to-orange-500',
    infrastructure: 'from-indigo-500 to-blue-500',
    branding: 'from-pink-500 to-rose-500',
    marketing: 'from-red-500 to-pink-500',
    launch: 'from-emerald-500 to-teal-500',
    operations: 'from-slate-500 to-gray-500',
    growth: 'from-purple-500 to-indigo-500',
    scaling: 'from-cyan-500 to-blue-500',
  };

  return (
    <>
      <Helmet>
        <title>{roadmap.title} - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-purple-900 via-primary-900/50 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
            <Link to="/" className="hover:text-white"><FiHome className="w-4 h-4" /></Link>
            <span>/</span>
            <Link to="/roadmaps" className="hover:text-white">Roadmaps</Link>
            <span>/</span>
            <span className="text-white truncate">{roadmap.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <span className="badge-secondary mb-4">🗺️ {roadmap.category}</span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {roadmap.title}
              </h1>
              {roadmap.subtitle && (
                <p className="text-xl text-primary-300 mb-4">{roadmap.subtitle}</p>
              )}
              <p className="text-lg text-dark-300 mb-6">
                {roadmap.shortDescription || roadmap.description?.substring(0, 200)}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-white">
                  <div className="text-2xl font-bold">{roadmap.totalSteps}</div>
                  <div className="text-sm text-dark-400">Total Steps</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold">
                    {roadmap.estimatedDuration?.total} {roadmap.estimatedDuration?.unit}
                  </div>
                  <div className="text-sm text-dark-400">Duration</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold">
                    {formatNumberShort(roadmap.stats?.enrolledCount || 0)}
                  </div>
                  <div className="text-sm text-dark-400">Enrolled</div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <FiStar className="w-6 h-6 text-yellow-500" fill="currentColor" />
                    {roadmap.rating?.average?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-sm text-dark-400">Rating</div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="card-glass p-6 rounded-3xl sticky top-24">
              {isEnrolled ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🎯</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      You're Enrolled!
                    </h3>
                    <p className="text-dark-300 text-sm">
                      Keep going to complete your journey
                    </p>
                  </div>

                  {userProgress && (
                    <div className="mb-6">
                      <div className="flex justify-between text-white mb-2">
                        <span className="text-sm">Progress</span>
                        <span className="font-bold">{userProgress.completionPercentage}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
                          style={{ width: `${userProgress.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-dark-300">
                        {userProgress.completedSteps} of {roadmap.totalSteps} steps completed
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => document.getElementById('steps').scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary w-full mb-3"
                  >
                    <FiPlay className="w-4 h-4" />
                    Continue Learning
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🚀</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-dark-300 text-sm">
                      Free enrollment · Lifetime access
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span>{roadmap.totalSteps} step-by-step lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span>Free learning resources</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span>Progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span>Certificate on completion</span>
                    </div>
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-primary w-full"
                  >
                    {enrolling ? <ButtonLoader text="Enrolling..." /> : (
                      <>
                        Enroll for Free
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="steps" className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: FiZap },
              { id: 'steps', label: `Steps (${roadmap.totalSteps})`, icon: FiTarget },
              { id: 'objectives', label: 'Objectives', icon: FiAward },
              { id: 'faqs', label: 'FAQs', icon: FiUsers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 card p-8">
                <h2 className="text-2xl font-bold mb-4">About This Roadmap</h2>
                <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line mb-6">
                  {roadmap.description}
                </p>

                {roadmap.expectedOutcomes?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">What You'll Achieve</h3>
                    <ul className="space-y-2">
                      {roadmap.expectedOutcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <FiCheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-dark-700 dark:text-dark-200">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Investment */}
                <div className="card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5" /> Total Investment
                  </h3>
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {formatCurrencyShort(roadmap.totalInvestment?.minimum || 0)} - {formatCurrencyShort(roadmap.totalInvestment?.maximum || 0)}
                  </div>
                  <p className="text-sm text-dark-500">Estimated total cost</p>
                </div>

                {/* Prerequisites */}
                {roadmap.prerequisites && (
                  <div className="card p-6">
                    <h3 className="font-bold mb-4">Prerequisites</h3>
                    <div className="space-y-2 text-sm">
                      {roadmap.prerequisites.experience?.length > 0 && (
                        <div>
                          <div className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Experience:</div>
                          <ul className="list-disc list-inside text-dark-500 space-y-1">
                            {roadmap.prerequisites.experience.slice(0, 3).map((exp, i) => (
                              <li key={i}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Steps Tab */}
          {activeTab === 'steps' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Roadmap Steps</h2>
                {isEnrolled && (
                  <div className="text-sm text-dark-500">
                    Progress: {userProgress?.completedSteps || 0}/{roadmap.totalSteps}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {roadmap.steps?.map((step, i) => {
                  const status = getStepStatus(step.stepNumber);
                  const isExpanded = expandedStep === step.stepNumber;

                  return (
                    <div
                      key={step._id || i}
                      className={`card overflow-hidden transition-all ${
                        status === 'in_progress' ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                        className="w-full p-6 flex items-start gap-4 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left"
                      >
                        {/* Step Number */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                            status === 'completed'
                              ? 'bg-success-500 text-white'
                              : status === 'in_progress'
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-100 dark:bg-dark-700 text-dark-400'
                          }`}
                        >
                          {status === 'completed' ? <FiCheck className="w-6 h-6" /> : step.stepNumber}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded-full text-white bg-gradient-to-r ${
                                phaseColors[step.phase] || 'from-gray-500 to-slate-500'
                              }`}
                            >
                              {step.phase?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            {step.priority === 'critical' && (
                              <span className="badge-danger text-xs">Critical</span>
                            )}
                            {step.isOptional && (
                              <span className="badge-outline text-xs">Optional</span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-dark-500 line-clamp-1">
                            {step.shortDescription || step.description?.substring(0, 100)}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {step.estimatedDuration?.value} {step.estimatedDuration?.unit}
                            </span>
                            {step.estimatedCost?.amount > 0 && (
                              <span className="flex items-center gap-1">
                                <FiDollarSign className="w-3 h-3" />
                                {formatCurrencyShort(step.estimatedCost.amount)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <FiChevronDown className="w-6 h-6" />
                          ) : (
                            <FiChevronRight className="w-6 h-6" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-dark-100 dark:border-dark-700 p-6 bg-dark-50 dark:bg-dark-800/50 animate-fade-in">
                          <div className="prose dark:prose-invert max-w-none mb-6">
                            <p className="text-dark-700 dark:text-dark-200 whitespace-pre-line">
                              {step.description}
                            </p>
                          </div>

                          {step.tasks?.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-bold mb-3 flex items-center gap-2">
                                <FiTarget className="w-4 h-4" /> Tasks
                              </h4>
                              <div className="space-y-2">
                                {step.tasks.map((task, ti) => (
                                  <div key={ti} className="flex items-start gap-2 text-sm">
                                    <FiCircle className="w-4 h-4 text-dark-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-medium">{task.title}</div>
                                      {task.description && (
                                        <div className="text-dark-500 text-xs">{task.description}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {step.checklist?.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-bold mb-3">✅ Checklist</h4>
                              <div className="space-y-2">
                                {step.checklist.map((item, ci) => (
                                  <label key={ci} className="flex items-start gap-2 cursor-pointer">
                                    <input type="checkbox" className="mt-1 rounded" />
                                    <span className="text-sm">{item.item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {step.tips?.length > 0 && (
                            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                              <h4 className="font-bold mb-3">💡 Pro Tips</h4>
                              <ul className="space-y-2 text-sm">
                                {step.tips.slice(0, 3).map((tip, ti) => (
                                  <li key={ti} className="flex gap-2">
                                    <span>{tip.icon || '💡'}</span>
                                    <span>{tip.tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {isEnrolled && status !== 'completed' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStepAction(step.stepNumber, 'completed')}
                                className="btn-primary btn-sm"
                              >
                                <FiCheck className="w-4 h-4" />
                                Mark Complete
                              </button>
                              {step.isOptional && (
                                <button
                                  onClick={() => handleStepAction(step.stepNumber, 'skipped')}
                                  className="btn-outline btn-sm"
                                >
                                  Skip
                                </button>
                              )}
                            </div>
                          )}

                          {status === 'completed' && (
                            <div className="badge-success">
                              <FiCheckCircle className="w-4 h-4" /> Completed
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objectives Tab */}
          {activeTab === 'objectives' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6">Learning Objectives</h2>
                {roadmap.learningObjectives?.length > 0 ? (
                  <div className="grid gap-4">
                    {roadmap.learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold text-dark-900 dark:text-white">
                            {obj.objective}
                          </div>
                          {obj.description && (
                            <div className="text-sm text-dark-500 mt-1">{obj.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500">No objectives listed for this roadmap.</p>
                )}
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                {roadmap.faqs?.length > 0 ? (
                  <div className="space-y-4">
                    {roadmap.faqs.map((faq, i) => (
                      <details key={i} className="border border-dark-100 dark:border-dark-700 rounded-xl">
                        <summary className="p-4 cursor-pointer font-semibold flex items-center justify-between">
                          {faq.question}
                          <FiChevronDown className="w-5 h-5" />
                        </summary>
                        <div className="px-4 pb-4 text-dark-600 dark:text-dark-300">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500">No FAQs available yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default RoadmapDetailPage;