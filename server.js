require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const helmet = require('helmet');
const morgan = require('morgan');



// Connect to MongoDB Atlas
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // 10mb for base64 avatar images
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));



// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Auth-specific stricter rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/pomodoro', require('./routes/pomodoro'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/sessions', require('./routes/sessions'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FocusHub API is running!',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FocusHub API running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  PUT    /api/profile');
  console.log('  POST   /api/pomodoro/complete');
  console.log('  GET    /api/pomodoro/history');
  console.log('  GET    /api/pomodoro/stats');
  console.log('  GET    /api/leaderboard');
  console.log('  GET    /api/leaderboard/me');
  console.log('  POST   /api/rooms/join');
  console.log('  POST   /api/rooms/leave');
  console.log('  GET    /api/rooms/stats');
  console.log('  POST   /api/rooms/chat');
  console.log('  GET    /api/rooms/:roomType/messages');
  console.log('  GET    /api/health');
});

// ─── Graceful Shutdown ───────────────────────────────────────
const mongoose = require('mongoose'); // make sure mongoose is imported at the top

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});LSD