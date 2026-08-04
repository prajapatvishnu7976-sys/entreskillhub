// ============================================
// EntreSkillHub - Business Ideas Listing Page
// Filters, sorting, pagination, search
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch, FiFilter, FiX, FiGrid, FiList,
  FiSliders, FiTrendingUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BusinessIdeaCard } from '../components/common/Card';
import { GridSkeleton, CenteredLoader } from '../components/common/Loader';
import businessService from '../services/businessService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  BUSINESS_CATEGORIES, DIFFICULTY_LEVELS, INVESTMENT_RANGES,
} from '../utils/constants';
import { debounce } from '../utils/helpers';

const BusinessIdeasPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    minInvestment: searchParams.get('minInvestment') || '',
    maxInvestment: searchParams.get('maxInvestment') || '',
    isBeginnerFriendly: searchParams.get('isBeginnerFriendly') === 'true',
    isLowInvestment: searchParams.get('isLowInvestment') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    isTrending: searchParams.get('isTrending') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  // Fetch business ideas
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await businessService.getAll(params);

      if (response.data.success) {
        setIdeas(response.data.data);
        setTotal(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load business ideas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch saved ideas
  const fetchSavedIdeas = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await userService.getSavedBusinesses();
      if (response.data.success) {
        setSavedIdeas(response.data.data.savedBusinesses.map((b) => b._id));
      }
    } catch (error) {
      console.error('Failed to fetch saved:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    fetchSavedIdeas();
  }, [fetchSavedIdeas]);

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== false && value !== 12) {
        params[key] = value.toString();
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search (debounced)
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, q: value, page: 1 }));
    }, 500),
    []
  );

  // Reset filters
  const resetFilters = () => {
    setFilters({
      q: '',
      category: '',
      difficulty: '',
      minInvestment: '',
      maxInvestment: '',
      isBeginnerFriendly: false,
      isLowInvestment: false,
      isFeatured: false,
      isTrending: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    });
  };

  // Handle bookmark
  const handleBookmark = async (ideaId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save ideas');
      return;
    }

    try {
      const response = await userService.toggleSaveBusiness(ideaId);
      if (response.data.success) {
        if (response.data.data.isSaved) {
          setSavedIdeas((prev) => [...prev, ideaId]);
          toast.success('❤️ Added to favorites!');
        } else {
          setSavedIdeas((prev) => prev.filter((id) => id !== ideaId));
          toast.success('Removed from favorites');
        }
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== '' &&
      value !== false &&
      !['sortBy', 'sortOrder', 'page', 'limit'].includes(key)
  ).length;

  return (
    <>
      <Helmet>
        <title>Business Ideas - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="badge-primary mb-4">💡 500+ Business Ideas</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Discover Your Next <span className="gradient-text">Big Idea</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            Explore hundreds of business ideas tailored to your skills, budget, and interests.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                defaultValue={filters.q}
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search business ideas, categories..."
                className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-xl text-white placeholder:text-dark-400 rounded-2xl border border-white/20 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FiSliders className="w-5 h-5" />
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3 text-dark-700 dark:text-dark-200">Category</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !filters.category
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleFilterChange('category', cat.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.category === cat.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3 text-dark-700 dark:text-dark-200">Difficulty</h4>
                  <div className="space-y-1">
                    {DIFFICULTY_LEVELS.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() =>
                          handleFilterChange(
                            'difficulty',
                            filters.difficulty === diff.value ? '' : diff.value
                          )
                        }
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.difficulty === diff.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${diff.color}`}></span>
                        <span>{diff.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3 text-dark-700 dark:text-dark-200">Investment</h4>
                  <div className="space-y-1">
                    {INVESTMENT_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (
                            filters.minInvestment === range.min.toString() &&
                            filters.maxInvestment === range.max.toString()
                          ) {
                            handleFilterChange('minInvestment', '');
                            handleFilterChange('maxInvestment', '');
                          } else {
                            handleFilterChange('minInvestment', range.min.toString());
                            handleFilterChange(
                              'maxInvestment',
                              range.max === Infinity ? '99999999' : range.max.toString()
                            );
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.minInvestment === range.min.toString()
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        <span>{range.icon}</span>
                        <span>{range.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h4 className="text-sm font-bold mb-3 text-dark-700 dark:text-dark-200">Quick Filters</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'isBeginnerFriendly', label: '🌱 Beginner Friendly' },
                      { key: 'isLowInvestment', label: '💰 Low Investment' },
                      { key: 'isFeatured', label: '⭐ Featured' },
                      { key: 'isTrending', label: '🔥 Trending' },
                    ].map((filter) => (
                      <label
                        key={filter.key}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-700"
                      >
                        <input
                          type="checkbox"
                          checked={filters[filter.key]}
                          onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-outline btn-sm relative"
                  >
                    <FiFilter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <div className="text-sm">
                    <span className="font-bold text-dark-900 dark:text-white">{total}</span>{' '}
                    <span className="text-dark-500">business ideas found</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Sort */}
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="input py-2 text-sm flex-1 sm:flex-initial"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="popularity-desc">Most Popular</option>
                    <option value="investment-asc">Lowest Investment</option>
                    <option value="investment-desc">Highest Investment</option>
                    <option value="title-asc">A-Z</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-700 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-dark-600 shadow-sm'
                          : 'text-dark-400'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-dark-600 shadow-sm'
                          : 'text-dark-400'
                      }`}
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.q && (
                    <span className="badge-primary flex items-center gap-1">
                      Search: "{filters.q}"
                      <button onClick={() => handleFilterChange('q', '')}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="badge-primary flex items-center gap-1">
                      {filters.category}
                      <button onClick={() => handleFilterChange('category', '')}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.difficulty && (
                    <span className="badge-primary flex items-center gap-1">
                      Difficulty: {filters.difficulty.replace('_', ' ')}
                      <button onClick={() => handleFilterChange('difficulty', '')}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Results */}
              {loading ? (
                <GridSkeleton count={9} />
              ) : ideas.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">No business ideas found</h3>
                  <p className="text-dark-500 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button onClick={resetFilters} className="btn-primary">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {ideas.map((idea) => (
                      <BusinessIdeaCard
                        key={idea._id}
                        idea={idea}
                        onBookmark={handleBookmark}
                        isBookmarked={savedIdeas.includes(idea._id)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleFilterChange('page', filters.page - 1)}
                        disabled={filters.page === 1}
                        className="btn-outline btn-sm disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (filters.page <= 3) pageNum = i + 1;
                          else if (filters.page >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = filters.page - 2 + i;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleFilterChange('page', pageNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                                filters.page === pageNum
                                  ? 'bg-primary-500 text-white'
                                  : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleFilterChange('page', filters.page + 1)}
                        disabled={filters.page === totalPages}
                        className="btn-outline btn-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default BusinessIdeasPage;