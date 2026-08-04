// ============================================
// EntreSkillHub - Reusable Card Components
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart, FiEye, FiClock, FiDollarSign, FiTrendingUp,
  FiStar, FiUser, FiCalendar, FiBookmark, FiShare2,
} from 'react-icons/fi';
import { formatCurrencyShort, formatNumberShort, truncate } from '../../utils/helpers';

// ============================================
// Business Idea Card
// ============================================
export const BusinessIdeaCard = ({ idea, onBookmark, isBookmarked = false, showScore = false }) => {
  const difficultyColors = {
    very_easy: 'bg-green-100 text-green-700',
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    very_hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="card-hover overflow-hidden group animate-fade-in-up">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500">
        {idea.coverImage?.url ? (
          <img
            src={idea.coverImage.url}
            alt={idea.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {idea.icon || '💼'}
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          {idea.isFeatured && (
            <span className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-lg">
              ⭐ Featured
            </span>
          )}
          {idea.isTrending && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
              🔥 Trending
            </span>
          )}
          {idea.isBeginnerFriendly && (
            <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg">
              🌱 Beginner
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        {onBookmark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onBookmark(idea._id);
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xl ${
              isBookmarked
                ? 'bg-danger-500 text-white'
                : 'bg-white/90 text-dark-700 hover:bg-danger-500 hover:text-white'
            }`}
          >
            <FiHeart className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Match Score */}
        {showScore && idea.matchScore && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold rounded-full shadow-lg">
            {idea.matchScore}% Match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {idea.category}
          </span>
          {idea.difficulty && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${difficultyColors[idea.difficulty] || 'bg-gray-100 text-gray-700'}`}>
              {idea.difficulty.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 line-clamp-2">
          {idea.shortDescription || truncate(idea.description, 100)}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400 mb-4 pb-4 border-b border-dark-100 dark:border-dark-700">
          <div className="flex items-center gap-1">
            <FiDollarSign className="w-4 h-4" />
            <span className="font-semibold">
              {idea.investment?.minimum === 0 ? 'Free' : formatCurrencyShort(idea.investment?.minimum || 0)}+
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            <span>
              {idea.timeToStart?.duration || 30} {idea.timeToStart?.unit || 'days'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            <span>{formatNumberShort(idea.stats?.viewCount || 0)}</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="text-sm font-bold text-dark-900 dark:text-white">
              {idea.rating?.average ? idea.rating.average.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-dark-400">
              ({idea.rating?.total || 0})
            </span>
          </div>

          {/* View Button */}
          <Link
            to={`/business-ideas/${idea.slug || idea._id}`}
            className="btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Mentor Card
// ============================================
export const MentorCard = ({ mentor }) => {
  return (
    <div className="card-hover overflow-hidden group">
      {/* Header with Gradient */}
      <div className="relative h-24 bg-gradient-to-br from-primary-500 to-secondary-500">
        {mentor.isTopMentor && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg">
            👑 Top Mentor
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-start gap-4 -mt-12 mb-4">
          <div className="relative">
            {mentor.user?.profileImage?.url ? (
              <img
                src={mentor.user.profileImage.url}
                alt={mentor.user.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-dark-800 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white dark:border-dark-800 shadow-xl">
                {mentor.user?.name?.charAt(0) || 'M'}
              </div>
            )}
            {mentor.availability?.isAvailable && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">
          {mentor.user?.name}
        </h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3 line-clamp-1">
          {mentor.title}
        </p>

        {/* Rating & Sessions */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="font-bold">{mentor.rating?.average?.toFixed(1) || 'N/A'}</span>
            <span className="text-dark-400">({mentor.rating?.total || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-dark-500">
            <FiUser className="w-4 h-4" />
            <span>{mentor.stats?.completedSessions || 0} sessions</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 line-clamp-2">
          {mentor.shortBio || truncate(mentor.professionalBio, 100)}
        </p>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertiseCategories?.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-100 dark:border-dark-700">
          <div>
            <div className="text-xs text-dark-500">Starting at</div>
            <div className="text-lg font-bold text-dark-900 dark:text-white">
              {mentor.pricing?.isFree
                ? 'Free'
                : `₹${mentor.pricing?.sessionRates?.[0]?.price || '999'}/hr`}
            </div>
          </div>
          <Link to={`/mentors/${mentor.slug || mentor._id}`} className="btn-primary btn-sm">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Roadmap Card
// ============================================
export const RoadmapCard = ({ roadmap }) => {
  return (
    <Link
      to={`/roadmaps/${roadmap.slug || roadmap._id}`}
      className="card-hover overflow-hidden group block"
    >
      <div className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
        {roadmap.coverImage?.url ? (
          <img
            src={roadmap.coverImage.url}
            alt={roadmap.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🗺️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-xl rounded-lg">
              {roadmap.totalSteps} Steps
            </span>
            <span className="px-2 py-1 bg-white/20 backdrop-blur-xl rounded-lg">
              {roadmap.estimatedDuration?.total} {roadmap.estimatedDuration?.unit}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-2">
          {roadmap.category}
        </div>
        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {roadmap.title}
        </h3>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 line-clamp-2">
          {roadmap.shortDescription || truncate(roadmap.description, 100)}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <FiUser className="w-4 h-4 text-dark-400" />
            <span className="text-dark-500">
              {formatNumberShort(roadmap.stats?.enrolledCount || 0)} enrolled
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="font-bold">{roadmap.rating?.average?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// Resource Card
// ============================================
export const ResourceCard = ({ resource }) => {
  const typeIcons = {
    video: '🎥',
    article: '📄',
    checklist: '✅',
    guide: '📖',
    template: '📋',
    course: '🎓',
    ebook: '📚',
    podcast: '🎙️',
  };

  return (
    <Link
      to={`/resources/${resource.slug || resource._id}`}
      className="card-hover overflow-hidden group block"
    >
      <div className="relative h-40 bg-gradient-to-br from-orange-500 to-red-500 overflow-hidden">
        {resource.thumbnail?.url ? (
          <img
            src={resource.thumbnail.url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {typeIcons[resource.resourceType] || '📄'}
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xl text-dark-700 text-xs font-bold rounded-lg">
            {typeIcons[resource.resourceType]} {resource.resourceType?.toUpperCase()}
          </span>
        </div>

        {resource.access === 'free' && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">
            FREE
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
          {resource.category}
        </div>
        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 line-clamp-2">
          {resource.shortDescription || truncate(resource.description, 100)}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-dark-500">
            <span className="flex items-center gap-1">
              <FiEye className="w-4 h-4" />
              {formatNumberShort(resource.stats?.viewCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {resource.duration?.value || 5}m
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="font-bold">{resource.rating?.average?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// Stat Card
// ============================================
export const StatCard = ({ icon: Icon, label, value, change, color = 'primary', trend = 'up' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
  };

  return (
    <div className="card p-6 group hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
          {typeof Icon === 'string' ? (
            <span className="text-2xl">{Icon}</span>
          ) : (
            <Icon className="w-7 h-7" />
          )}
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              trend === 'up'
                ? 'bg-success-100 text-success-700'
                : 'bg-danger-100 text-danger-700'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-dark-900 dark:text-white mb-1">{value}</div>
        <div className="text-sm text-dark-500 dark:text-dark-400">{label}</div>
      </div>
    </div>
  );
};

export default { BusinessIdeaCard, MentorCard, RoadmapCard, ResourceCard, StatCard };