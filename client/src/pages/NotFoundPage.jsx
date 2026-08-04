// ============================================
// EntreSkillHub - 404 Not Found Page
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 Not Found | EntreSkillHub</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 px-4 py-16 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          {/* 404 Text */}
          <div className="mb-8">
            <h1 className="text-[150px] sm:text-[200px] font-bold gradient-text leading-none animate-fade-in-down">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
          </div>

          {/* Message */}
          <div className="animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-dark-300 mb-8 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
              Let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/" className="btn-primary btn-lg">
                <FiHome className="w-5 h-5" />
                Back to Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn-glass btn-lg"
              >
                <FiArrowLeft className="w-5 h-5" />
                Go Back
              </button>
              <Link to="/business-ideas" className="btn-outline btn-lg text-white border-white/30 hover:bg-white/10">
                <FiSearch className="w-5 h-5" />
                Explore Ideas
              </Link>
            </div>
          </div>

          {/* Helpful Links */}
          <div className="mt-16 pt-8 border-t border-white/10 animate-fade-in-up animate-delay-300">
            <p className="text-dark-400 text-sm mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Business Ideas', to: '/business-ideas' },
                { label: 'Roadmaps', to: '/roadmaps' },
                { label: 'Mentors', to: '/mentors' },
                { label: 'Resources', to: '/resources' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg border border-white/10 transition-all hover:scale-105"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;