const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roomType: {
    type: String,
    enum: ['study', 'meditate', 'yoga', 'read', 'interact', 'music'],
    default: 'study'
  },
  durationMinutes: { type: Number, default: 25 },
  xpEarned: { type: Number, default: 50 },
  completedAt: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) } // YYYY-MM-DD
});

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);
