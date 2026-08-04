// ============================================
// EntreSkillHub - Bookmarks Page
// ============================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiBookmark, FiTrash2, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BusinessIdeaCard } from '../components/common/Card';
import { CenteredLoader } from '../components/common/Loader';
import userService from '../services/userService';

const BookmarksPage = () => {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const response = await userService.getSavedBusinesses();
      if (response.data.success) {
        setSaved(response.data.data.savedBusinesses);
      }
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await userService.toggleSaveBusiness(id);
      setSaved((prev) => prev.filter((s) => s._id !== id));
      toast.success('Removed from bookmarks');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Bookmarks - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <FiBookmark className="w-10 h-10 text-primary-500" />
                My Bookmarks
              </h1>
              <p className="text-dark-500">
                {saved.length} saved {saved.length === 1 ? 'idea' : 'ideas'}
              </p>
            </div>
          </div>

          {loading ? (
            <CenteredLoader message="Loading your bookmarks..." />
          ) : saved.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold mb-3">No bookmarks yet</h3>
              <p className="text-dark-500 mb-8 max-w-md mx-auto">
                Start exploring business ideas and save your favorites to view them later.
              </p>
              <a href="/business-ideas" className="btn-primary">
                Explore Business Ideas
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((idea) => (
                <BusinessIdeaCard
                  key={idea._id}
                  idea={idea}
                  onBookmark={handleRemove}
                  isBookmarked={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookmarksPage;