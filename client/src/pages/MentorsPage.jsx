// ============================================
// EntreSkillHub - Mentors Listing Page
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiFilter, FiX, FiSliders, FiStar, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { MentorCard } from '../components/common/Card';
import { GridSkeleton } from '../components/common/Loader';
import mentorService from '../services/mentorService';
import { debounce } from '../utils/helpers';

const MENTOR_CATEGORIES = [
  { value: 'Business Strategy', icon: '📊' },
  { value: 'Marketing', icon: '📢' },
  { value: 'Finance', icon: '💰' },
  { value: 'Digital & IT Skills', icon: '💻' },
  { value: 'Food & Catering', icon: '🍳' },
  { value: 'Beauty & Wellness', icon: '💄' },
  { value: 'Tailoring & Fashion', icon: '✂️' },
  { value: 'Handicrafts & Artisan', icon: '🎨' },
  { value: 'Legal', icon: '⚖️' },
  { value: 'Operations', icon: '⚙️' },
];

const MentorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minRating: searchParams.get('minRating') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    mode: searchParams.get('mode') || '',
    mentorLevel: searchParams.get('mentorLevel') || '',
    isTopMentor: searchParams.get('isTopMentor') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    isAvailable: searchParams.get('isAvailable') === 'true',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await mentorService.getAll(params);
      if (response.data.success) {
        setMentors(response.data.data);
        setTotal(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== false && value !== 12) params[key] = value.toString();
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, q: value, page: 1 }));
    }, 500),
    []
  );

  const resetFilters = () => {
    setFilters({
      q: '', category: '', minRating: '', maxPrice: '', mode: '',
      mentorLevel: '', isTopMentor: false, isFeatured: false, isAvailable: false,
      sortBy: 'rating', sortOrder: 'desc', page: 1, limit: 12,
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== '' && value !== false &&
      !['sortBy', 'sortOrder', 'page', 'limit'].includes(key)
  ).length;

  return (
    <>
      <Helmet>
        <title>Expert Mentors - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-secondary-900 via-primary-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="badge-secondary mb-4">👨‍🏫 200+ Expert Mentors</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Learn from <span className="gradient-text">Industry Experts</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            Connect with verified mentors who've built successful businesses.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                defaultValue={filters.q}
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search by name, expertise, industry..."
                className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-xl text-white placeholder:text-dark-400 rounded-2xl border border-white/20 focus:outline-none focus:border-primary-500 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FiSliders className="w-5 h-5" />
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={resetFilters} className="text-sm text-primary-600 font-medium">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Expertise</h4>
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
                    {MENTOR_CATEGORIES.map((cat) => (
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

                {/* Rating */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Minimum Rating</h4>
                  <div className="space-y-1">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          handleFilterChange(
                            'minRating',
                            filters.minRating === rating.toString() ? '' : rating.toString()
                          )
                        }
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.minRating === rating.toString()
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        <FiStar className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        <span>{rating}+ Stars</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Mode */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Session Mode</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'online', label: '💻 Online', icon: '💻' },
                      { value: 'in_person', label: '🏢 In-Person', icon: '🏢' },
                      { value: 'hybrid', label: '🌐 Hybrid', icon: '🌐' },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() =>
                          handleFilterChange('mode', filters.mode === mode.value ? '' : mode.value)
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.mode === mode.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mentor Level */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Level</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'master', label: '👑 Master' },
                      { value: 'expert', label: '⭐ Expert' },
                      { value: 'senior', label: '🎯 Senior' },
                      { value: 'associate', label: '💼 Associate' },
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() =>
                          handleFilterChange('mentorLevel', filters.mentorLevel === level.value ? '' : level.value)
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          filters.mentorLevel === level.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h4 className="text-sm font-bold mb-3">Quick Filters</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'isTopMentor', label: '👑 Top Mentor' },
                      { key: 'isFeatured', label: '⭐ Featured' },
                      { key: 'isAvailable', label: '🟢 Available Now' },
                    ].map((filter) => (
                      <label key={filter.key} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-700">
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
              <div className="card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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
                    <span className="text-dark-500">mentors found</span>
                  </div>
                </div>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input py-2 text-sm"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="sessions">Most Sessions</option>
                  <option value="price">Price: Low to High</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {loading ? (
                <GridSkeleton count={6} />
              ) : mentors.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">No mentors found</h3>
                  <p className="text-dark-500 mb-6">Try adjusting your filters</p>
                  <button onClick={resetFilters} className="btn-primary">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mentors.map((mentor) => (
                      <MentorCard key={mentor._id} mentor={mentor} />
                    ))}
                  </div>

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

export default MentorsPage;