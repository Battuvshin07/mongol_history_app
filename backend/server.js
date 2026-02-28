// ============================================
// server.js - Application Entry Point
// 13th Century Mongolian History App Backend
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./src/config/db');

// Import route modules
const authRoutes = require('./src/routes/auth.routes');
const contentRoutes = require('./src/routes/content.routes');
const personRoutes = require('./src/routes/person.routes');
const eventRoutes = require('./src/routes/event.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const cultureRoutes = require('./src/routes/culture.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Import error handling middleware
const { errorHandler, notFound } = require('./src/middleware/error.middleware');

// Initialize Express app
const app = express();

// ============================================
// Global Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mongol History API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/culture', cultureRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// Error Handling
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
