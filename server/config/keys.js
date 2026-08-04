// ============================================
// EntreSkillHub - Application Keys & Constants
// Centralized configuration management
// ============================================

/**
 * Environment Configuration
 * Validates and exports all environment variables
 */

// ============================================
// Required Environment Variables Validation
// ============================================
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
];

const optionalEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLIENT_URL',
];

/**
 * Validate required environment variables
 * Throws error if any required variable is missing
 */
const validateEnvVars = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════╗');
    console.error('║  ❌ Missing Required Environment Variables       ║');
    console.error('╠══════════════════════════════════════════════════╣');
    missing.forEach((key) => {
      console.error(`║  ⚠️  ${key.padEnd(44)}║`);
    });
    console.error('╠══════════════════════════════════════════════════╣');
    console.error('║  Please check your .env file                     ║');
    console.error('╚══════════════════════════════════════════════════╝');
    console.error('');

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Check optional variables and warn
  const missingOptional = optionalEnvVars.filter((key) => !process.env[key]);
  if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('');
    console.warn('⚠️  Missing optional environment variables:');
    missingOptional.forEach((key) => {
      console.warn(`   - ${key}`);
    });
    console.warn('   Some features may not work properly.');
    console.warn('');
  }
};

// ============================================
// Application Configuration Object
// ============================================
const config = {
  // App Configuration
  app: {
    name: process.env.APP_NAME || 'EntreSkillHub',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    url: process.env.APP_URL || 'http://localhost:5000',
    apiVersion: process.env.API_VERSION || 'v1',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Database Configuration
  database: {
    uri: process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/entreskillhub',
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    expire: process.env.JWT_EXPIRE || '30d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '90d',
    issuer: 'entreskillhub',
    audience: 'entreskillhub-users',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.FROM_NAME || 'EntreSkillHub',
    fromEmail: process.env.FROM_EMAIL || 'noreply@entreskillhub.com',
    isConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    isConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authWindowMs: 15 * 60 * 1000, // 15 minutes for auth routes
    authMax: 10, // 10 attempts for auth routes
    apiWindowMs: 15 * 60 * 1000,
    apiMax: 200,
  },

  // Pagination Configuration
  pagination: {
    defaultPage: 1,
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 10,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 50,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxProfileImageSize: 5 * 1024 * 1024, // 5MB
    maxDocumentSize: 25 * 1024 * 1024, // 25MB
    maxFiles: 5,
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf', 'application/msword'],
    profileImageDimensions: { width: 500, height: 500 },
    resourceImageDimensions: { width: 1200, height: 630 },
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
        ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: 12,
    passwordMinLength: 8,
    passwordMaxLength: 128,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
    csrfProtection: process.env.NODE_ENV === 'production',
  },

  // User Roles
  roles: {
    USER: 'user',
    MENTOR: 'mentor',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superadmin',
    allRoles: ['user', 'mentor', 'admin', 'superadmin'],
    privilegedRoles: ['admin', 'superadmin'],
  },

  // Skill Categories
  skillCategories: [
    'Tailoring & Fashion',
    'Handicrafts & Artisan',
    'Food & Catering',
    'Beauty & Wellness',
    'Repair & Maintenance',
    'Digital & IT Skills',
    'Photography & Videography',
    'Tutoring & Education',
    'Gardening & Agriculture',
    'Fitness & Sports',
    'Music & Entertainment',
    'Writing & Content',
    'Translation & Languages',
    'Driving & Logistics',
    'Cleaning & Housekeeping',
    'Pet Care & Grooming',
    'Carpentry & Woodwork',
    'Electrical & Plumbing',
    'Painting & Decoration',
    'Other',
  ],

  // Business Categories
  businessCategories: [
    'Home-Based Business',
    'Service Business',
    'Product Business',
    'Online Business',
    'Food Business',
    'Retail Business',
    'Creative Business',
    'Technical Service',
    'Educational Service',
    'Health & Wellness',
    'Event Management',
    'Consulting',
    'Freelancing',
    'E-commerce',
    'Social Enterprise',
  ],

  // Difficulty Levels
  difficultyLevels: ['beginner', 'intermediate', 'advanced'],

  // Investment Ranges
  investmentRanges: [
    { label: 'No Investment', min: 0, max: 0 },
    { label: 'Under ₹5,000', min: 1, max: 5000 },
    { label: '₹5,000 - ₹25,000', min: 5000, max: 25000 },
    { label: '₹25,000 - ₹1,00,000', min: 25000, max: 100000 },
    { label: '₹1,00,000 - ₹5,00,000', min: 100000, max: 500000 },
    { label: 'Above ₹5,00,000', min: 500000, max: Infinity },
  ],

  // Resource Types
  resourceTypes: ['video', 'article', 'checklist', 'guide', 'template', 'tool', 'course'],

  // Session Status
  sessionStatus: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],

  // Roadmap Step Status
  stepStatus: ['not_started', 'in_progress', 'completed', 'skipped'],

  // Content Status
  contentStatus: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],

  // Notification Types
  notificationTypes: [
    'welcome',
    'session_booked',
    'session_confirmed',
    'session_cancelled',
    'content_approved',
    'content_rejected',
    'new_recommendation',
    'milestone_achieved',
    'mentor_message',
    'system_update',
  ],
};

// ============================================
// Export configuration
// ============================================
module.exports = { config, validateEnvVars };