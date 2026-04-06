const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 80
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: { type: String, trim: true, default: '' },
  age: { type: Number, min: 10, max: 100 },
  course: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' }, // base64 or URL

  // XP & Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },

  // Pomodoro stats
  totalPomodoros: { type: Number, default: 0 },
  todayPomodoros: { type: Number, default: 0 },
  lastPomodoroDate: { type: String, default: '' }, // YYYY-MM-DD

  // Badges
  badges: [{
    name: String,
    emoji: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  // Room visits
  roomVisits: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Auto-update level based on XP
userSchema.pre('save', function(next) {
  this.level = Math.max(1, Math.floor(this.xp / 100));
  next();
});

module.exports = mongoose.model('User', userSchema);
