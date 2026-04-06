const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: String,  // 'study' | 'meditate' | 'yoga' | 'read' | 'interact'
    required: true
  },
  roomName: { type: String, default: '' },
  durationMinutes: { type: Number, default: 25 },
  xpEarned: { type: Number, default: 50 },
  pomodorosCompleted: { type: Number, default: 1 },
  dailyGoalHit: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now }
});

// Index for fast user history queries
sessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
