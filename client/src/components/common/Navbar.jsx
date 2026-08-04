import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiSearch, FiSun, FiMoon, FiBell, FiUser,
  FiLogOut, FiSettings, FiBookmark, FiGrid, FiTarget,
  FiUsers, FiBook, FiTrendingUp, FiChevronDown, FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isMentor } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const exploreRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(event.target)) setIsExploreOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsExploreOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/business-ideas?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const exploreLinks = [
    { icon: FiZap, label: 'Business Ideas', to: '/business-ideas', desc: 'Discover ideas matched to your skills', color: 'from-blue-500 to-cyan-500' },
    { icon: FiTarget, label: 'Roadmaps', to: '/roadmaps', desc: 'Step-by-step guides to success', color: 'from-purple-500 to-pink-500' },
    { icon: FiBook, label: 'Resources', to: '/resources', desc: 'Videos, articles, and templates', color: 'from-orange-500 to-red-500' },
    { icon: FiUsers, label: 'Mentors', to: '/mentors', desc: 'Connect with expert mentors', color: 'from-green-500 to-emerald-500' },
  ];

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl shadow-soft border-b border-dark-100 dark:border-dark-800'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/30">
                🚀
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold gradient-text-primary">EntreSkillHub</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : 'text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
              >
                Home
              </Link>

              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isExploreOpen ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : 'text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  Explore
                  <FiChevronDown className={`w-4 h-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExploreOpen && (
                  <div className="absolute top-full left-0 mt-2 w-96 card p-3 animate-scale-in origin-top-left shadow-xl">
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <link.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-dark-900 dark:text-white text-sm">{link.label}</div>
                          <div className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to) ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10' : 'text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>

                {isSearchOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 card p-3 animate-scale-in origin-top-right">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search ideas, mentors, resources..."
                          autoFocus
                          className="input pl-10 pr-4 text-sm"
                        />
                      </div>
                    </form>
                    <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-700">
                      <p className="text-xs text-dark-500 mb-2">Popular:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Baking', 'Photography', 'Coding', 'Tailoring'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { navigate(`/business-ideas?q=${tag}`); setIsSearchOpen(false); }}
                            className="px-3 py-1 text-xs bg-dark-100 dark:bg-dark-700 rounded-full hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:text-primary-600 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleTheme} className="p-2.5 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate('/dashboard'); toast.success('No new notifications!'); }}
                    className="relative p-2.5 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                  >
                    <FiBell className="w-5 h-5" />
                  </button>

                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                    >
                      {user?.profileImage?.url && user.profileImage.url !== '' ? (
                        <img src={user.profileImage.url} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-dark-700" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(user?.name)}
                        </div>
                      )}
                    </button>

                    {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 card p-2 animate-scale-in origin-top-right shadow-xl">
                        <div className="p-3 border-b border-dark-100 dark:border-dark-700">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                              {getInitials(user?.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-dark-900 dark:text-white truncate">{user?.name}</div>
                              <div className="text-xs text-dark-500 truncate">{user?.email}</div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link to="/dashboard" className="dropdown-item"><FiGrid className="w-4 h-4" /><span>Dashboard</span></Link>
                          <Link to="/profile" className="dropdown-item"><FiUser className="w-4 h-4" /><span>My Profile</span></Link>
                          <Link to="/bookmarks" className="dropdown-item"><FiBookmark className="w-4 h-4" /><span>Bookmarks</span></Link>
                          <Link to="/sessions" className="dropdown-item"><FiUsers className="w-4 h-4" /><span>My Sessions</span></Link>
                          <Link to="/skill-assessment" className="dropdown-item"><FiTarget className="w-4 h-4" /><span>Skill Assessment</span></Link>
                          {isMentor && (
                            <Link to="/mentor/dashboard" className="dropdown-item"><FiTrendingUp className="w-4 h-4" /><span>Mentor Dashboard</span></Link>
                          )}
                          {isAdmin && (
                            <Link to="/admin" className="dropdown-item text-danger-600"><FiSettings className="w-4 h-4" /><span>Admin Panel</span></Link>
                          )}
                        </div>

                        <div className="pt-2 border-t border-dark-100 dark:border-dark-700">
                          <button onClick={handleLogout} className="dropdown-item text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 w-full">
                            <FiLogOut className="w-4 h-4" /><span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-dark-700 dark:text-dark-200 hover:text-primary-600 transition-colors">Sign In</Link>
                  <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-white dark:bg-dark-900 overflow-y-auto animate-slide-up">
            <div className="container-custom py-6">
              <div className="space-y-2 mb-6">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={`block px-4 py-3 rounded-xl font-medium transition-all ${isActive(link.to) ? 'bg-primary-500 text-white' : 'text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-dark-400 mb-3 px-4">Explore</p>
                <div className="space-y-2">
                  {exploreLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                        <link.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-dark-900 dark:text-white">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {!isAuthenticated && (
                <div className="space-y-3 pt-6 border-t border-dark-100 dark:border-dark-700">
                  <Link to="/login" className="btn-outline w-full">Sign In</Link>
                  <Link to="/register" className="btn-primary w-full">Get Started Free</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;