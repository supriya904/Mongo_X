const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configuration and database connection
const config = require('./config/config');
const connectDB = require('./config/database');

// Import middleware
const requestLogger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = config.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
if (config.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Import routes
const tweetRoutes = require('./routes/tweets');
const userRoutes = require('./routes/users');
const followRoutes = require('./routes/follows');
const notificationRoutes = require('./routes/notifications');
const trendingRoutes = require('./routes/trending');

// Use routes
app.use('/api/tweets', tweetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/trending', trendingRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend server is running!',
    server: 'Twitter Clone API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    server: 'Twitter Clone Backend',
    version: '1.0.0',
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('🚀======================================🚀');
  console.log('🎯 Twitter Clone Backend Server Started');
  console.log('🚀======================================🚀');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📱 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('🚀======================================🚀');
});
