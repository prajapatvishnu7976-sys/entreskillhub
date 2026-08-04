// ============================================
// EntreSkillHub - Application Constants
// ============================================

export const APP_CONFIG = {
  NAME: 'EntreSkillHub',
  TAGLINE: 'Skill to Startup Enablement Platform',
  DESCRIPTION: 'Transform your skills into successful micro-businesses',
  VERSION: '1.0.0',
  URL: process.env.REACT_APP_APP_URL || 'http://localhost:3000',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  SUPPORT_EMAIL: 'support@entreskillhub.com',
  COMPANY: 'EntreSkillHub Team',
  COPYRIGHT_YEAR: new Date().getFullYear(),
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SKILL_ASSESSMENT: '/skill-assessment',
  BUSINESS_IDEAS: '/business-ideas',
  BUSINESS_IDEA_DETAIL: '/business-ideas/:identifier',
  ROADMAPS: '/roadmaps',
  ROADMAP_DETAIL: '/roadmaps/:identifier',
  RESOURCES: '/resources',
  RESOURCE_DETAIL: '/resources/:identifier',
  MENTORS: '/mentors',
  MENTOR_DETAIL: '/mentors/:identifier',
  MENTOR_DASHBOARD: '/mentor/dashboard',
  BECOME_MENTOR: '/become-mentor',
  BOOKMARKS: '/bookmarks',
  SESSIONS: '/sessions',
  ADMIN: '/admin',
  NOT_FOUND: '*',
};

export const USER_ROLES = {
  USER: 'user',
  MENTOR: 'mentor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

export const ENTREPRENEURSHIP_STAGES = [
  { value: 'exploring', label: 'Just Exploring', icon: '🔍', color: 'bg-blue-500' },
  { value: 'planning', label: 'Planning', icon: '📋', color: 'bg-purple-500' },
  { value: 'starting', label: 'Starting Out', icon: '🚀', color: 'bg-orange-500' },
  { value: 'operating', label: 'Operating', icon: '⚙️', color: 'bg-green-500' },
  { value: 'scaling', label: 'Scaling Up', icon: '📈', color: 'bg-pink-500' },
];

export const SKILL_CATEGORIES = [
  { value: 'Tailoring & Fashion', icon: '✂️', color: 'from-pink-500 to-rose-500' },
  { value: 'Handicrafts & Artisan', icon: '🎨', color: 'from-purple-500 to-indigo-500' },
  { value: 'Food & Catering', icon: '🍳', color: 'from-orange-500 to-red-500' },
  { value: 'Beauty & Wellness', icon: '💄', color: 'from-pink-500 to-purple-500' },
  { value: 'Repair & Maintenance', icon: '🔧', color: 'from-gray-500 to-slate-600' },
  { value: 'Digital & IT Skills', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'Photography & Videography', icon: '📸', color: 'from-indigo-500 to-purple-500' },
  { value: 'Tutoring & Education', icon: '📚', color: 'from-teal-500 to-cyan-500' },
  { value: 'Gardening & Agriculture', icon: '🌱', color: 'from-green-500 to-emerald-500' },
  { value: 'Fitness & Sports', icon: '💪', color: 'from-red-500 to-orange-500' },
  { value: 'Music & Entertainment', icon: '🎵', color: 'from-violet-500 to-purple-500' },
  { value: 'Writing & Content', icon: '✍️', color: 'from-amber-500 to-orange-500' },
  { value: 'Translation & Languages', icon: '🌍', color: 'from-blue-500 to-indigo-500' },
  { value: 'Driving & Logistics', icon: '🚗', color: 'from-slate-500 to-gray-600' },
  { value: 'Cleaning & Housekeeping', icon: '🧹', color: 'from-cyan-500 to-blue-500' },
  { value: 'Pet Care & Grooming', icon: '🐾', color: 'from-amber-500 to-yellow-500' },
  { value: 'Carpentry & Woodwork', icon: '🪚', color: 'from-orange-600 to-amber-600' },
  { value: 'Electrical & Plumbing', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { value: 'Painting & Decoration', icon: '🎨', color: 'from-fuchsia-500 to-pink-500' },
  { value: 'Other', icon: '💼', color: 'from-gray-500 to-slate-500' },
];

export const BUSINESS_CATEGORIES = [
  { value: 'Home-Based Business', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
  { value: 'Service Business', icon: '🤝', color: 'from-purple-500 to-pink-500' },
  { value: 'Product Business', icon: '📦', color: 'from-orange-500 to-red-500' },
  { value: 'Online Business', icon: '🌐', color: 'from-indigo-500 to-blue-500' },
  { value: 'Food Business', icon: '🍔', color: 'from-red-500 to-orange-500' },
  { value: 'Retail Business', icon: '🏪', color: 'from-teal-500 to-green-500' },
  { value: 'Creative Business', icon: '🎨', color: 'from-pink-500 to-purple-500' },
  { value: 'Technical Service', icon: '⚙️', color: 'from-gray-500 to-slate-600' },
  { value: 'Educational Service', icon: '📚', color: 'from-emerald-500 to-teal-500' },
  { value: 'Health & Wellness', icon: '💚', color: 'from-green-500 to-emerald-500' },
  { value: 'Event Management', icon: '🎉', color: 'from-violet-500 to-pink-500' },
  { value: 'Consulting', icon: '💼', color: 'from-blue-600 to-indigo-600' },
  { value: 'Freelancing', icon: '💻', color: 'from-cyan-500 to-blue-500' },
  { value: 'E-commerce', icon: '🛒', color: 'from-amber-500 to-orange-500' },
  { value: 'Social Enterprise', icon: '❤️', color: 'from-rose-500 to-pink-500' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'very_easy', label: 'Very Easy', color: 'bg-green-500', textColor: 'text-green-700' },
  { value: 'easy', label: 'Easy', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { value: 'hard', label: 'Hard', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { value: 'very_hard', label: 'Very Hard', color: 'bg-red-500', textColor: 'text-red-700' },
];

export const INVESTMENT_RANGES = [
  { label: 'No Investment', min: 0, max: 0, icon: '🆓' },
  { label: 'Under ₹5K', min: 1, max: 5000, icon: '💵' },
  { label: '₹5K - ₹25K', min: 5000, max: 25000, icon: '💰' },
  { label: '₹25K - ₹1L', min: 25000, max: 100000, icon: '💎' },
  { label: '₹1L - ₹5L', min: 100000, max: 500000, icon: '🏆' },
  { label: 'Above ₹5L', min: 500000, max: Infinity, icon: '👑' },
];

export const RESOURCE_TYPES = [
  { value: 'video', label: 'Video', icon: '🎥', color: 'from-red-500 to-pink-500' },
  { value: 'article', label: 'Article', icon: '📄', color: 'from-blue-500 to-cyan-500' },
  { value: 'checklist', label: 'Checklist', icon: '✅', color: 'from-green-500 to-emerald-500' },
  { value: 'guide', label: 'Guide', icon: '📖', color: 'from-purple-500 to-indigo-500' },
  { value: 'template', label: 'Template', icon: '📋', color: 'from-orange-500 to-amber-500' },
  { value: 'tool', label: 'Tool', icon: '🔧', color: 'from-gray-500 to-slate-500' },
  { value: 'course', label: 'Course', icon: '🎓', color: 'from-teal-500 to-cyan-500' },
  { value: 'ebook', label: 'E-Book', icon: '📚', color: 'from-indigo-500 to-blue-500' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️', color: 'from-fuchsia-500 to-purple-500' },
  { value: 'webinar', label: 'Webinar', icon: '📹', color: 'from-rose-500 to-pink-500' },
];

export const PLATFORM_FEATURES = [
  {
    icon: '🎯',
    title: 'Smart Matching',
    description: 'AI-powered business ideas matched to your unique skills and interests',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🗺️',
    title: 'Step-by-Step Roadmaps',
    description: 'Detailed roadmaps guiding you from idea to successful business',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '👨‍🏫',
    title: 'Expert Mentorship',
    description: 'Connect with verified mentors who\'ve built successful businesses',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '📚',
    title: 'Learning Library',
    description: 'Access videos, articles, checklists, and templates - all in one place',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Track your journey with visual dashboards and achievement badges',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: '💼',
    title: 'Business Toolkit',
    description: 'Legal templates, financial calculators, and marketing resources',
    color: 'from-teal-500 to-cyan-500',
  },
];

export const HERO_STATS = [
  { value: '10K+', label: 'Active Entrepreneurs', icon: '👥' },
  { value: '500+', label: 'Business Ideas', icon: '💡' },
  { value: '200+', label: 'Expert Mentors', icon: '🎓' },
  { value: '95%', label: 'Success Rate', icon: '⭐' },
];

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Boutique Owner',
    location: 'Mumbai',
    image: 'https://i.pravatar.cc/150?img=48',
    quote: 'EntreSkillHub transformed my tailoring skills into a thriving boutique. The roadmap was so clear, I felt confident every step of the way.',
    rating: 5,
    business: 'Priya\'s Boutique',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Food Truck Entrepreneur',
    location: 'Delhi',
    image: 'https://i.pravatar.cc/150?img=12',
    quote: 'From cooking at home to owning 3 food trucks - all thanks to the mentors and business ideas I discovered here!',
    rating: 5,
    business: 'Kumar\'s Kitchen',
  },
  {
    name: 'Anita Verma',
    role: 'Digital Marketer',
    location: 'Bangalore',
    image: 'https://i.pravatar.cc/150?img=45',
    quote: 'The learning resources are gold! I turned my content writing hobby into a full-fledged digital agency.',
    rating: 5,
    business: 'Verma Digital',
  },
  {
    name: 'Suresh Patel',
    role: 'Handicraft Exporter',
    location: 'Jaipur',
    image: 'https://i.pravatar.cc/150?img=15',
    quote: 'The step-by-step roadmap helped me export my handicrafts internationally. Now I employ 20+ artisans!',
    rating: 5,
    business: 'Patel Handicrafts',
  },
  {
    name: 'Meera Reddy',
    role: 'Fitness Trainer',
    location: 'Hyderabad',
    image: 'https://i.pravatar.cc/150?img=47',
    quote: 'From gym trainer to online fitness coach with 500+ clients. This platform gave me the confidence and skills.',
    rating: 5,
    business: 'FitLife Academy',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Sign Up & Profile',
    description: 'Create your account and tell us about your skills, interests, and goals',
    icon: '📝',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: 2,
    title: 'Discover Ideas',
    description: 'Get personalized business ideas matched perfectly to your unique profile',
    icon: '💡',
    color: 'from-purple-500 to-pink-500',
  },
  {
    step: 3,
    title: 'Follow Roadmap',
    description: 'Follow our detailed step-by-step roadmap tailored to your chosen business',
    icon: '🗺️',
    color: 'from-orange-500 to-red-500',
  },
  {
    step: 4,
    title: 'Learn & Connect',
    description: 'Access learning resources and connect with expert mentors for guidance',
    icon: '🎓',
    color: 'from-green-500 to-emerald-500',
  },
  {
    step: 5,
    title: 'Launch & Grow',
    description: 'Start your business with confidence and scale it to new heights',
    icon: '🚀',
    color: 'from-indigo-500 to-purple-500',
  },
];

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/entreskillhub',
  twitter: 'https://twitter.com/entreskillhub',
  instagram: 'https://instagram.com/entreskillhub',
  linkedin: 'https://linkedin.com/company/entreskillhub',
  youtube: 'https://youtube.com/@entreskillhub',
  github: 'https://github.com/entreskillhub',
};

export const STORAGE_KEYS = {
  TOKEN: 'esh-token',
  REFRESH_TOKEN: 'esh-refresh-token',
  THEME: 'esh-theme',
  USER: 'esh-user',
  PREFERENCES: 'esh-preferences',
  ONBOARDING: 'esh-onboarding-complete',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  OPTIONS: [6, 12, 24, 48],
};

export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 200,
  SCROLL: 100,
};

export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
};