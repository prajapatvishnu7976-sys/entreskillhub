// ============================================
// EntreSkillHub - Learning Resources Page
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ResourceCard } from '../components/common/Card';
import { GridSkeleton } from '../components/common/Loader';
import resourceService from '../services/resourceService';
import { RESOURCE_TYPES } from '../utils/constants';
import { debounce } from '../utils/helpers';

const RESOURCE_CATEGORIES = [
  'Business Basics', 'Marketing', 'Sales', 'Finance', 'Legal & Compliance',
  'Operations', 'Technology', 'Skill Development', 'Success Stories',
];

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    resourceType: searchParams.get('resourceType') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    access: searchParams.get('access') || '',
    sortBy: 'popular',
    page: 1,
    limit: 12,
  });

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await resourceService.getAll(params);
      if (response.data.success) {
        setResources(response.data.data);
        setTotal(response.data.pagination.totalItems);
      }
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const debouncedSearch = useCallback(
    debounce((value) => setFilters((prev) => ({ ...prev, q: value, page: 1 })), 500),
    []
  );

  return (
    <>
      <Helmet>
        <title>Learning Resources - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <section className="relative py-16 bg-gradient-to-br from-orange-900 via-red-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="badge-accent mb-4" style={{ color: '#c2410c' }}>📚 Free Resources</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Learn from <span className="gradient-text">Expert Content</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            Videos, articles, checklists, and templates to grow your business.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                defaultValue={filters.q}
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-xl text-white placeholder:text-dark-400 rounded-2xl border border-white/20 focus:outline-none focus:border-primary-500 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          {/* Resource Type Tabs */}
          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => handleFilterChange('resourceType', '')}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  !filters.resourceType
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                📚 All Resources
              </button>
              {RESOURCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleFilterChange('resourceType', type.value)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    filters.resourceType === type.value
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-6 lg:sticky lg:top-24">
                <h3 className="text-lg font-bold mb-6">Filters</h3>

                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Category</h4>
                  <div className="space-y-1">
                    {RESOURCE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          filters.category === cat
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Difficulty</h4>
                  <div className="space-y-1">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleFilterChange('difficulty', filters.difficulty === level ? '' : level)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${
                          filters.difficulty === level
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3">Access</h4>
                  <div className="space-y-1">
                    {[
                      { value: 'free', label: '🆓 Free' },
                      { value: 'premium', label: '💎 Premium' },
                    ].map((access) => (
                      <button
                        key={access.value}
                        onClick={() => handleFilterChange('access', filters.access === access.value ? '' : access.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          filters.access === access.value
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                        }`}
                      >
                        {access.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="card p-4 mb-6 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold">{total}</span>{' '}
                  <span className="text-dark-500">resources found</span>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-outline btn-sm"
                >
                  <FiFilter className="w-4 h-4" /> Filters
                </button>
              </div>

              {loading ? (
                <GridSkeleton count={6} />
              ) : resources.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold mb-2">No resources found</h3>
                  <p className="text-dark-500">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
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

export default ResourcesPage;