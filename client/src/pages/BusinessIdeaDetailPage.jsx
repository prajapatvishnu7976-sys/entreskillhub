// ============================================
// EntreSkillHub - Business Idea Detail Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiHeart, FiShare2, FiClock, FiDollarSign, FiTrendingUp,
  FiStar, FiUser, FiCheckCircle, FiAlertTriangle, FiTarget,
  FiZap, FiEye, FiArrowRight, FiHome, FiPackage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader } from '../components/common/Loader';
import { BusinessIdeaCard } from '../components/common/Card';
import businessService from '../services/businessService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatCurrencyShort, formatNumberShort } from '../utils/helpers';

const BusinessIdeaDetailPage = () => {
  const { identifier } = useParams();
  const { isAuthenticated } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await businessService.getById(identifier);
        if (response.data.success) {
          setIdea(response.data.data.businessIdea);
          setIsSaved(response.data.data.isSaved);

          const similarResponse = await businessService.getSimilar(
            response.data.data.businessIdea._id,
            4
          );
          if (similarResponse.data.success) {
            setSimilar(similarResponse.data.data.similar);
          }
        }
      } catch (error) {
        toast.error('Failed to load business idea');
      } finally {
        setLoading(false);
      }
    };
    fetchIdea();
  }, [identifier]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save this idea');
      return;
    }
    try {
      const response = await userService.toggleSaveBusiness(idea._id);
      if (response.data.success) {
        setIsSaved(response.data.data.isSaved);
        toast.success(response.data.data.isSaved ? '❤️ Saved!' : 'Removed from saved');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/business-ideas/${idea.slug || idea._id}`;
    try {
      await businessService.share(idea._id);
      if (navigator.share) {
        await navigator.share({ title: idea.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('🔗 Link copied to clipboard!');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('🔗 Link copied!');
      } catch (e) {
        toast.error('Failed to share');
      }
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <CenteredLoader message="Loading business idea..." />
    </>
  );

  if (!idea) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">Business Idea Not Found</h1>
          <Link to="/business-ideas" className="btn-primary">
            Browse All Ideas
          </Link>
        </div>
      </div>
    </>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiZap },
    { id: 'investment', label: 'Investment', icon: FiDollarSign },
    { id: 'requirements', label: 'Requirements', icon: FiPackage },
    { id: 'market', label: 'Market', icon: FiTrendingUp },
    { id: 'challenges', label: 'Challenges', icon: FiAlertTriangle },
  ];

  return (
    <>
      <Helmet>
        <title>{idea.title} - EntreSkillHub</title>
        <meta name="description" content={idea.shortDescription || idea.description?.substring(0, 160)} />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative pt-8 pb-16 bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
            <Link to="/" className="hover:text-white">
              <FiHome className="w-4 h-4" />
            </Link>
            <span>/</span>
            <Link to="/business-ideas" className="hover:text-white">Business Ideas</Link>
            <span>/</span>
            <span className="text-white truncate max-w-xs">{idea.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Info */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge-primary">{idea.category}</span>
                {idea.isFeatured && (
                  <span className="badge bg-yellow-500 text-white">⭐ Featured</span>
                )}
                {idea.isTrending && (
                  <span className="badge bg-red-500 text-white">🔥 Trending</span>
                )}
                {idea.isBeginnerFriendly && (
                  <span className="badge bg-green-500 text-white">🌱 Beginner Friendly</span>
                )}
                {idea.isLowInvestment && (
                  <span className="badge bg-blue-500 text-white">💰 Low Investment</span>
                )}
              </div>

              {/* Title & Tagline */}
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {idea.title}
              </h1>
              {idea.tagline && (
                <p className="text-xl text-primary-400 mb-4 italic">"{idea.tagline}"</p>
              )}
              <p className="text-lg text-dark-300 mb-6">
                {idea.shortDescription || idea.description?.substring(0, 200)}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="font-bold">{idea.rating?.average?.toFixed(1) || 'N/A'}</span>
                  <span className="text-dark-400 text-sm">({idea.rating?.total || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-primary-400" />
                  <span>{formatNumberShort(idea.stats?.viewCount || 0)} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-green-400" />
                  <span>{formatNumberShort(idea.stats?.startedCount || 0)} started</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to={idea.roadmap ? `/roadmaps/${idea.roadmap._id || idea.roadmap}` : '/register'}
                  className="btn-primary btn-lg"
                >
                  {idea.roadmap ? 'View Roadmap' : 'Get Started'}
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleBookmark}
                  className={`btn-glass btn-lg ${isSaved ? 'text-red-400' : ''}`}
                >
                  <FiHeart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleShare} className="btn-glass btn-lg">
                  <FiShare2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Right: Cover Image */}
            <div className="hidden lg:block">
              <div className="card-glass p-2 rounded-3xl overflow-hidden aspect-square">
                {idea.coverImage?.url ? (
                  <img
                    src={idea.coverImage.url}
                    alt={idea.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-9xl">
                    {idea.icon || '💼'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Cards */}
      <section className="py-8 bg-white dark:bg-dark-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm text-dark-500 mb-1">Investment</div>
              <div className="text-xl font-bold text-primary-600">
                {formatCurrencyShort(idea.investment?.minimum || 0)} - {formatCurrencyShort(idea.investment?.maximum || 0)}
              </div>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm text-dark-500 mb-1">Time to Start</div>
              <div className="text-xl font-bold text-secondary-600">
                {idea.timeToStart?.duration || 30} {idea.timeToStart?.unit || 'days'}
              </div>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm text-dark-500 mb-1">Monthly Revenue</div>
              <div className="text-xl font-bold text-success-600">
                {formatCurrencyShort(idea.revenue?.monthly?.min || 0)}+
              </div>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm text-dark-500 mb-1">Difficulty</div>
              <div className="text-xl font-bold text-accent-600 capitalize">
                {(idea.difficulty || 'medium').replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          {/* Tab Buttons */}
          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max border-b border-dark-100 dark:border-dark-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-4">About This Business</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">
                      {idea.description}
                    </p>
                  </div>

                  {idea.successFactors?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FiTarget className="w-5 h-5 text-primary-500" />
                        Success Factors
                      </h3>
                      <div className="space-y-3">
                        {idea.successFactors.slice(0, 5).map((factor, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                            <FiCheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-dark-900 dark:text-white">
                                {factor.factor}
                              </div>
                              {factor.description && (
                                <div className="text-sm text-dark-500 mt-1">{factor.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'investment' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Investment Breakdown</h2>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-6 bg-primary-50 dark:bg-primary-500/10 rounded-2xl">
                      <div className="text-sm text-dark-500 mb-2">Minimum Investment</div>
                      <div className="text-3xl font-bold text-primary-600">
                        {formatCurrency(idea.investment?.minimum || 0)}
                      </div>
                    </div>
                    <div className="p-6 bg-secondary-50 dark:bg-secondary-500/10 rounded-2xl">
                      <div className="text-sm text-dark-500 mb-2">Maximum Investment</div>
                      <div className="text-3xl font-bold text-secondary-600">
                        {formatCurrency(idea.investment?.maximum || 0)}
                      </div>
                    </div>
                  </div>

                  {idea.investment?.breakdown?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4">Cost Breakdown</h3>
                      <div className="space-y-3">
                        {idea.investment.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                            <div>
                              <div className="font-medium">{item.item}</div>
                              {item.description && (
                                <div className="text-sm text-dark-500 mt-1">{item.description}</div>
                              )}
                            </div>
                            <div className="font-bold text-primary-600">
                              {formatCurrency(item.cost)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 p-6 bg-gradient-to-br from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 rounded-2xl">
                    <h3 className="text-lg font-bold mb-3">💰 Expected Returns</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-dark-500">Monthly Revenue</div>
                        <div className="text-xl font-bold text-success-600">
                          {formatCurrency(idea.revenue?.monthly?.min || 0)} - {formatCurrency(idea.revenue?.monthly?.max || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-dark-500">Profit Margin</div>
                        <div className="text-xl font-bold text-primary-600">
                          {idea.revenue?.profitMargin || 30}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Requirements</h2>

                  {idea.requiredSkills?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-4">🎯 Required Skills</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {idea.requiredSkills.map((req, i) => (
                          <div key={i} className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{req.skill?.icon || '🎯'}</span>
                              <span className="font-semibold">{req.skill?.name || 'Skill'}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <span className={`badge text-xs ${
                                req.importance === 'essential'
                                  ? 'bg-red-100 text-red-700'
                                  : req.importance === 'important'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {req.importance?.replace('_', ' ')}
                              </span>
                              <span className="badge-outline text-xs">
                                {req.minimumLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {idea.equipment?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-4">🔧 Equipment Needed</h3>
                      <div className="space-y-2">
                        {idea.equipment.slice(0, 8).map((eq, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-dark-100 dark:border-dark-700 rounded-lg">
                            <div className="flex items-center gap-2">
                              {eq.isEssential && <span className="text-red-500">*</span>}
                              <span>{eq.name}</span>
                            </div>
                            {eq.cost > 0 && (
                              <span className="text-sm font-bold text-primary-600">
                                {formatCurrency(eq.cost)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {idea.locationRequirement && (
                    <div>
                      <h3 className="text-lg font-bold mb-4">📍 Location</h3>
                      <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                        <div className="font-semibold capitalize">
                          {idea.locationRequirement.type?.replace(/_/g, ' ')}
                        </div>
                        {idea.locationRequirement.minimumSpace?.area && (
                          <div className="text-sm text-dark-500 mt-1">
                            Minimum {idea.locationRequirement.minimumSpace.area} {idea.locationRequirement.minimumSpace.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'market' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Market Analysis</h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                      <div className="text-sm text-dark-500 mb-1">Market Size</div>
                      <div className="text-lg font-bold capitalize">
                        {idea.targetMarket?.marketSize || 'Medium'}
                      </div>
                    </div>
                    <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl">
                      <div className="text-sm text-dark-500 mb-1">Geography</div>
                      <div className="text-lg font-bold capitalize">
                        {idea.targetMarket?.geography || 'Local'}
                      </div>
                    </div>
                  </div>

                  {idea.targetMarket?.primaryAudience && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">🎯 Target Audience</h3>
                      <p className="text-dark-600 dark:text-dark-300">
                        {idea.targetMarket.primaryAudience}
                      </p>
                    </div>
                  )}

                  {idea.scalability && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">📈 Scalability</h3>
                      <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl">
                        <div className="font-semibold capitalize mb-2">
                          Potential: {idea.scalability.potential?.replace('_', ' ')}
                        </div>
                        {idea.scalability.scalingOptions?.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-sm text-dark-600 dark:text-dark-300">
                            {idea.scalability.scalingOptions.slice(0, 4).map((option, i) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="card p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Challenges & Solutions</h2>

                  {idea.challenges?.length > 0 ? (
                    <div className="space-y-4">
                      {idea.challenges.slice(0, 6).map((challenge, i) => (
                        <div key={i} className="p-5 border border-dark-100 dark:border-dark-700 rounded-xl">
                          <div className="flex items-start gap-3 mb-2">
                            <FiAlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-bold text-dark-900 dark:text-white mb-1">
                                {challenge.challenge}
                              </h4>
                              {challenge.description && (
                                <p className="text-sm text-dark-500">{challenge.description}</p>
                              )}
                            </div>
                          </div>
                          {challenge.solution && (
                            <div className="mt-3 p-3 bg-success-50 dark:bg-success-500/10 rounded-lg">
                              <div className="text-xs font-bold text-success-700 uppercase mb-1">
                                💡 Solution
                              </div>
                              <p className="text-sm text-dark-700 dark:text-dark-200">
                                {challenge.solution}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dark-500">No challenges data available.</p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <div className="card p-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white sticky top-24">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-white/90 mb-4 text-sm">
                  Take the first step towards building your dream business.
                </p>
                {idea.roadmap && (
                  <Link
                    to={`/roadmaps/${idea.roadmap._id || idea.roadmap}`}
                    className="btn-glass w-full mb-3"
                  >
                    View Roadmap
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/mentors" className="btn-glass w-full">
                  Find a Mentor
                </Link>
              </div>

              {/* Tags */}
              {idea.tags?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold mb-3">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-dark-100 dark:bg-dark-700 rounded-lg text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar Ideas */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8">Similar Business Ideas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similar.map((s) => (
                  <BusinessIdeaCard key={s._id} idea={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default BusinessIdeaDetailPage;