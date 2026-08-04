require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const { connectDB, getConnectionStatus } = require('./config/db');
const { initializeCloudinary, checkCloudinaryConfig } = require('./config/cloudinary');
const { config, validateEnvVars } = require('./config/keys');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const businessIdeaRoutes = require('./routes/businessIdeaRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const mentorSessionRoutes = require('./routes/mentorSessionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

try {
  validateEnvVars();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
}

const app = express();
const PORT = config.app.port || 5000;
const API_VERSION = config.app.apiVersion || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'tags', 'skills'] }));
app.use(compression());

// Logging
if (config.app.env === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟡' : status >= 300 ? '🔵' : '🟢';
    if (config.app.env === 'development') {
      console.log(`${statusColor} ${req.method.padEnd(6)} ${status} | ${duration}ms | ${req.originalUrl}`);
    }
  });
  next();
});

// Health & Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 EntreSkillHub API Server is running!',
    version: '1.0.0',
    apiVersion: API_VERSION,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/health', async (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(dbStatus.isConnected ? 200 : 503).json({
    success: true,
    status: 'healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: dbStatus.isConnected ? 'connected' : 'disconnected',
  });
});

app.get(`${API_PREFIX}/info`, (req, res) => {
  res.json({
    success: true,
    apiName: 'EntreSkillHub API',
    version: API_VERSION,
    description: 'Skill-to-Startup Enablement Platform API',
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/skills`, skillRoutes);
app.use(`${API_PREFIX}/business-ideas`, businessIdeaRoutes);
app.use(`${API_PREFIX}/roadmaps`, roadmapRoutes);
app.use(`${API_PREFIX}/resources`, resourceRoutes);
app.use(`${API_PREFIX}/mentors`, mentorRoutes);
app.use(`${API_PREFIX}/sessions`, mentorSessionRoutes);
app.use(`${API_PREFIX}/progress`, progressRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);
app.use(`${API_PREFIX}/bookmarks`, bookmarkRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 & Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Cloudinary - optional, don't crash if not configured
    try {
      const cloudinaryResult = initializeCloudinary();
      if (cloudinaryResult) {
        await checkCloudinaryConfig();
      }
    } catch (cloudError) {
      console.warn('⚠️  Cloudinary setup skipped:', cloudError.message);
    }

    // Email verification - optional
    try {
      if (config.email.isConfigured) {
        const { verifyEmailConnection } = require('./utils/sendEmail');
        await verifyEmailConnection();
      } else {
        console.warn('⚠️  Email service not configured.');
      }
    } catch (emailError) {
      console.warn('⚠️  Email setup skipped:', emailError.message);
    }

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════╗');
      console.log('║                                                      ║');
      console.log('║       🚀 EntreSkillHub Server Started! 🚀           ║');
      console.log('║                                                      ║');
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log(`║  🌍 Environment: ${config.app.env.padEnd(37)}║`);
      console.log(`║  📡 Port: ${String(PORT).padEnd(44)}║`);
      console.log(`║  🔗 URL: ${config.app.url.padEnd(45)}║`);
      console.log(`║  📚 API: ${(config.app.url + API_PREFIX).padEnd(45)}║`);
      console.log(`║  ❤️  Health: ${(config.app.url + '/health').padEnd(41)}║`);
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log(`║  📦 Database: ${(getConnectionStatus().isConnected ? 'Connected ✅' : 'Disconnected ❌').padEnd(40)}║`);
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log('║                                                      ║');
      console.log('║      Made with ❤️  for Entrepreneurs                 ║');
      console.log('║                                                      ║');
      console.log('╚══════════════════════════════════════════════════════╝');
      console.log('');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down...`);
      server.close(async () => {
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed.');
          process.exit(0);
        } catch (error) {
          process.exit(1);
        }
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Don't crash on unhandled errors - just log them
    process.on('uncaughtException', (error) => {
      console.error('💥 UNCAUGHT EXCEPTION:', error.message);
      console.error(error.stack);
      // Don't exit in development
      if (config.app.env === 'production') {
        server.close(() => process.exit(1));
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('⚠️  Unhandled Promise Rejection:', reason?.message || reason);
      // Don't crash - just log
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;