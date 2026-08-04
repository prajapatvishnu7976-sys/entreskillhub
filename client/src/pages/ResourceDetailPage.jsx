// ============================================
// EntreSkillHub - Resource Detail Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiClock, FiStar, FiEye, FiShare2,
  FiCheckCircle, FiUser, FiHome, FiBookmark,
  FiMessageSquare, FiPlay,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CenteredLoader } from '../components/common/Loader';
import resourceService from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { formatNumberShort, getRelativeTime, getInitials } from '../utils/helpers';

const ResourceDetailPage = () => {
  const { identifier } = useParams();
  const { isAuthenticated } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [identifier]);

  const fetchResource = async () => {
    try {
      const response = await resourceService.getById(identifier);
      if (response.data.success) {
        setResource(response.data.data.resource);
      }
    } catch (error) {
      toast.error('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    try {
      await resourceService.markCompleted(resource._id);
      toast.success('🎉 Marked as completed!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await resourceService.addComment(resource._id, { content: comment });
      toast.success('Comment added!');
      setComment('');
      fetchResource();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartLearning = () => {
    if (resource.content?.videoUrl) {
      window.open(resource.content.videoUrl, '_blank');
    } else if (resource.content?.downloadUrl) {
      window.open(resource.content.downloadUrl, '_blank');
    } else {
      const el = document.getElementById('resource-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        toast.success('📚 Scroll down to start!');
      } else {
        toast.success('📚 Content ready below!');
      }
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark');
      return;
    }
    toast.success('📌 Resource bookmarked!');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('🔗 Link copied to clipboard!');
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('🔗 Link copied!');
      } catch (err) {
        toast.error('Failed to share');
      }
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <CenteredLoader message="Loading resource..." />
    </>
  );

  if (!resource) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <Link to="/resources" className="btn-primary">Browse Resources</Link>
        </div>
      </div>
    </>
  );

  const typeIcons = {
    video: '🎥', article: '📄', checklist: '✅', guide: '📖',
    template: '📋', course: '🎓', ebook: '📚', podcast: '🎙️',
  };

  return (
    <>
      <Helmet>
        <title>{resource.title} - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-orange-900 via-red-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
            <Link to="/" className="hover:text-white"><FiHome className="w-4 h-4" /></Link>
            <span>/</span>
            <Link to="/resources" className="hover:text-white">Resources</Link>
            <span>/</span>
            <span className="text-white truncate">{resource.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge bg-white/20 backdrop-blur-xl text-white">
                  {typeIcons[resource.resourceType]} {resource.resourceType?.toUpperCase()}
                </span>
                <span className="badge-primary">{resource.category}</span>
                {resource.access === 'free' && (
                  <span className="badge-success">FREE</span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {resource.title}
              </h1>
              {resource.subtitle && (
                <p className="text-xl text-orange-300 mb-4">{resource.subtitle}</p>
              )}
              <p className="text-lg text-dark-300 mb-6">
                {resource.shortDescription || resource.description?.substring(0, 200)}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-white mb-6">
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  <span>{resource.author?.name || resource.uploadedBy?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  <span>{resource.duration?.value || 5} {resource.duration?.unit || 'min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye className="w-5 h-5" />
                  <span>{formatNumberShort(resource.stats?.viewCount || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span>{resource.rating?.average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleStartLearning}
                  className="btn bg-white text-orange-600 hover:bg-white/90 btn-lg"
                >
                  <FiPlay className="w-5 h-5" />
                  Start Learning
                </button>
                <button onClick={handleComplete} className="btn-glass btn-lg">
                  <FiCheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
                <button onClick={handleBookmark} className="btn-glass btn-icon">
                  <FiBookmark className="w-5 h-5" />
                </button>
                <button onClick={handleShare} className="btn-glass btn-icon">
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              {resource.thumbnail?.url ? (
                <img
                  src={resource.thumbnail.url}
                  alt={resource.title}
                  className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-8xl shadow-2xl">
                  {typeIcons[resource.resourceType]}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video/Content */}
              {resource.content?.videoUrl && (
                <div className="card overflow-hidden">
                  <div className="aspect-video bg-black flex items-center justify-center text-white">
                    <button
                      onClick={() => window.open(resource.content.videoUrl, '_blank')}
                      className="text-center hover:scale-110 transition-transform"
                    >
                      <div className="text-6xl mb-2">▶️</div>
                      <p>Click to watch video</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div id="resource-content" className="card p-8">
                <h2 className="text-2xl font-bold mb-4">About This Resource</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">
                    {resource.description}
                  </p>
                </div>

                {resource.keyTakeaways?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Key Takeaways</h3>
                    <ul className="space-y-2">
                      {resource.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FiCheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Checklist Content */}
              {resource.resourceType === 'checklist' && resource.content?.checklistItems?.length > 0 && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold mb-4">✅ Checklist</h2>
                  <div className="space-y-3">
                    {resource.content.checklistItems.map((item, i) => (
                      <label key={i} className="flex items-start gap-3 p-3 border border-dark-100 dark:border-dark-700 rounded-xl cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800">
                        <input type="checkbox" className="mt-1 w-5 h-5 rounded" />
                        <div className="flex-1">
                          <div className="font-medium">{item.item}</div>
                          {item.description && (
                            <div className="text-sm text-dark-500 mt-1">{item.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FiMessageSquare className="w-6 h-6" />
                  Comments ({resource.stats?.commentCount || 0})
                </h2>

                {isAuthenticated ? (
                  <form onSubmit={handleComment} className="mb-6">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows="3"
                      className="textarea"
                    ></textarea>
                    <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary mt-3">
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-center">
                    <Link to="/login" className="text-primary-600 font-semibold">Login</Link>
                    <span className="text-dark-500 ml-1">to leave a comment</span>
                  </div>
                )}

                {resource.comments?.length > 0 ? (
                  <div className="space-y-4">
                    {resource.comments.slice(0, 10).map((c, i) => (
                      <div key={i} className="flex gap-3 p-3 border-b border-dark-100 dark:border-dark-700 last:border-b-0">
                        {c.user?.profileImage?.url ? (
                          <img src={c.user.profileImage.url} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {getInitials(c.user?.name || 'A')}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{c.user?.name || 'Anonymous'}</span>
                            <span className="text-xs text-dark-400">{getRelativeTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-dark-600 dark:text-dark-300">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-dark-500 py-8">Be the first to comment!</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <div className="card p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials(resource.author?.name || resource.uploadedBy?.name || 'A')}
                </div>
                <h3 className="font-bold">{resource.author?.name || resource.uploadedBy?.name}</h3>
                <p className="text-sm text-dark-500 mb-4">{resource.author?.credentials || 'Content Creator'}</p>
                <button
                  onClick={() => toast.success('Author profile coming soon!')}
                  className="btn-outline w-full btn-sm"
                >
                  View Profile
                </button>
              </div>

              {/* Related Skills */}
              {resource.relatedSkills?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold mb-4">Related Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.relatedSkills.map((skill, i) => (
                      <Link
                        key={i}
                        to={`/skills/${skill._id}`}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:scale-105 transition-transform"
                      >
                        {skill.icon} {skill.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {resource.tags?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-dark-100 dark:bg-dark-700 rounded-lg text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ResourceDetailPage;