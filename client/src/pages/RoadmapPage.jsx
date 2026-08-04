// ============================================
// EntreSkillHub - Roadmaps Listing Page
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiFilter, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { RoadmapCard } from '../components/common/Card';
import { GridSkeleton } from '../components/common/Loader';
import roadmapService from '../services/roadmapService';
import { BUSINESS_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';
import { debounce } from '../utils/helpers';

const RoadmapsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    isFeatured: searchParams.get('isFeatured') === 'true',
    sortBy: 'popular',
    page: 1,
    limit: 12,
  });

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === false) delete params[key];
      });

      const response = await roadmapService.getAll(params);
      if (response.data.success) {
        setRoadmaps(response.data.data);
        setTotal(response.data.pagination.totalItems);
      }
    } catch (error) {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

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
        <title>Business Roadmaps - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <section className="relative py-16 bg-gradient-to-br from-purple-900 via-pink-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="badge-secondary mb-4">🗺️ Proven Roadmaps</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Step-by-Step <span className="gradient-text">Business Roadmaps</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            Follow expert-designed roadmaps to launch your business successfully.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                defaultValue={filters.q}
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search roadmaps..."
                className="w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur-xl text-white placeholder:text-dark-400 rounded-2xl border border-white/20 focus:outline-none focus:border-primary-500 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="card p-6 lg:sticky lg:top-24">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FiSliders className="w-5 h-5" /> Filters
                </h3>

                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3">Category</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        !filters.category ? 'bg-primary-500 text-white' : 'hover:bg-dark-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleFilterChange('category', cat.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
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

                <div>
                  <h4 className="text-sm font-bold mb-3">Difficulty</h4>
                  <div className="space-y-1">
                    {DIFFICULTY_LEVELS.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() =>
                          handleFilterChange('difficulty', filters.difficulty === diff.value ? '' : diff.value)
                        }
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
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
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="card p-4 mb-6 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold">{total}</span> <span className="text-dark-500">roadmaps found</span>
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
              ) : roadmaps.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold mb-2">No roadmaps found</h3>
                  <p className="text-dark-500">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roadmaps.map((roadmap) => (
                    <RoadmapCard key={roadmap._id} roadmap={roadmap} />
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

export default RoadmapsPage;