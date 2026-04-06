const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PomodoroSession = require('../models/PomodoroSession');
const { protect } = require('../middleware/auth');

// POST /api/pomodoro/complete — log a completed pomodoro
router.post('/complete', protect, async (req, res) => {
  try {
    const { roomType, durationMinutes } = req.body;
    const user = req.user;

    const XP_PER_POMODORO = 50;
    const today = new Date().toISOString().slice(0, 10);

    // Reset today count if it's a new day
    if (user.lastPomodoroDate !== today) {
      user.todayPomodoros = 0;
      user.lastPomodoroDate = today;
    }

    user.todayPomodoros = Math.min(user.todayPomodoros + 1, 4);
    user.totalPomodoros += 1;
    user.xp += XP_PER_POMODORO;

    // Bonus XP for completing 4 pomodoros in a day
    let bonusXP = 0;
    if (user.todayPomodoros === 4) {
      bonusXP = 200;
      user.xp += bonusXP;

      // Award Mind Master badge if not already earned
      const hasBadge = user.badges.some(b => b.name === 'Mind Master');
      if (!hasBadge) {
        user.badges.push({ name: 'Mind Master', emoji: '🧠' });
      }
    }

    // First pomodoro badge
    if (user.totalPomodoros === 1) {
      user.badges.push({ name: 'First Focus', emoji: '🍅' });
    }

    // 10 total pomodoros badge
    if (user.totalPomodoros === 10) {
      user.badges.push({ name: 'Focus Warrior', emoji: '⚔️' });
    }

    await user.save();

    // Save session record
    await PomodoroSession.create({
      userId: user._id,
      roomType: roomType || 'study',
      durationMinutes: durationMinutes || 25,
      xpEarned: XP_PER_POMODORO + bonusXP,
      date: today
    });

    res.json({
      success: true,
      message: user.todayPomodoros === 4 ? 'Daily goal achieved! +200 XP bonus!' : `Pomodoro complete! +${XP_PER_POMODORO} XP`,
      xpEarned: XP_PER_POMODORO + bonusXP,
      bonusXP,
      user: {
        xp: user.xp,
        level: user.level,
        todayPomodoros: user.todayPomodoros,
        totalPomodoros: user.totalPomodoros,
        badges: user.badges
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pomodoro/history — user's pomodoro session history
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await PomodoroSession.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pomodoro/stats — aggregated stats for user
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const user = req.user;

    const todaySessions = await PomodoroSession.countDocuments({
      userId: user._id,
      date: today
    });

    res.json({
      success: true,
      stats: {
        todayPomodoros: todaySessions,
        totalPomodoros: user.totalPomodoros,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
