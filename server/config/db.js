// ============================================
// EntreSkillHub - Database Configuration
// MongoDB Connection with Mongoose
// ============================================

const mongoose = require('mongoose');

// Connection options for optimal performance
const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
};

// Track connection state
let isConnected = false;

/**
 * Connect to MongoDB
 * Handles connection with retry logic and comprehensive error handling
 */
const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing database connection');
    return;
  }

  try {
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    const conn = await mongoose.connect(mongoURI, connectionOptions);

    isConnected = true;

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     📦 MongoDB Connected Successfully    ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Host: ${conn.connection.host.padEnd(33)}║`);
    console.log(`║  Database: ${conn.connection.name.padEnd(29)}║`);
    console.log(`║  Port: ${String(conn.connection.port).padEnd(33)}║`);
    console.log(`║  State: Connected ✅${''.padEnd(21)}║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    return conn;
  } catch (error) {
    console.error('');
    console.error('╔══════════════════════════════════════════╗');
    console.error('║     ❌ MongoDB Connection Failed         ║');
    console.error('╠══════════════════════════════════════════╣');
    console.error(`║  Error: ${error.message.substring(0, 32).padEnd(32)}║`);
    console.error('╚══════════════════════════════════════════╝');
    console.error('');

    // Retry connection after 5 seconds
    if (process.env.NODE_ENV !== 'test') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB
 * Graceful shutdown handler
 */
const disconnectDB = async () => {
  if (!isConnected) {
    console.log('⚠️  No active database connection to close');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Get connection status
 * Returns current database connection state
 */
const getConnectionStatus = () => {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
    99: 'Uninitialized',
  };

  const state = mongoose.connection.readyState;

  return {
    isConnected: state === 1,
    state: states[state] || 'Unknown',
    stateCode: state,
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'N/A',
    port: mongoose.connection.port || 'N/A',
    models: Object.keys(mongoose.models),
    modelCount: Object.keys(mongoose.models).length,
  };
};

// ============================================
// Mongoose Event Listeners
// ============================================

// Connection established
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to database');
});

// Connection error
mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
  isConnected = false;
});

// Connection disconnected
mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from database');
  isConnected = false;
});

// Connection reconnected
mongoose.connection.on('reconnected', () => {
  console.log('🟢 Mongoose reconnected to database');
  isConnected = true;
});

// When Node process ends
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination (SIGINT)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during SIGINT shutdown:', error.message);
    process.exit(1);
  }
});

// When hosting platform sends SIGTERM
process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination (SIGTERM)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during SIGTERM shutdown:', error.message);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { connectDB, disconnectDB, getConnectionStatus };