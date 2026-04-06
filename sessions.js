const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Badge definitions
const BADGES = {
  first_pom:    { id: 'first_pom',    name: 'First Focus',   emoji: '🎯', desc: 'Completed your first Pomodoro' },
  streak_3:     { id: 'streak_3',     name: 'On Fire',       emoji: '🔥', desc: '3-day streak' },
  streak_7:     { id: 'streak_7',     name: 'Week Warrior',  emoji: '🗓️',  desc: '7-day streak' },
  streak_30:    { id: 'streak_30',    name: 'Month Master',  emoji: '📅', desc: '30-day streak' },
  mind_master:  { id: 'mind_master',  name: 'Mind Master',   emoji: '🌟', desc: 'Completed daily goal (4 Pomodoros)' },
  pom_50:       { id: 'pom_50',       name: 'Half Century',  emoji: '🏅', desc: '50 Pomodoros total' },
  pom_100:      { id: 'pom_100',      name: 'Century Club',  emoji: '💯', desc: '100 Pomodoros total' },
  xp_1000:      { id: 'xp_1000',     name: 'XP Crusher',    emoji: '⚡', desc: '1,000 XP earned' },
  xp_5000:      { id: 'xp_5000',     name: 'Legend',        emoji: '👑', desc: '5,000 XP earned' },
};

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// ─── POST /api/sessions/complete ──────────────────────────────────────────
// Call this when a Pomodoro timer completes
router.post('/complete', async (req, res) => {
  try {
    const { room, roomName, durationMinutes } = req.body;
    const user = await User.findById(req.user._id);
    const today = getTodayStr();

    // ── Reset today's count if a new day ──
    if (user.lastPomDate !== today) {
      user.pomodorosToday = 0;
      user.lastPomDate = today;
    }

    // ── Update streak ──
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (user.lastActiveDate === yesterday.toISOString().slice(0, 10)) {
      user.streak += 1;
    } else if (user.lastActiveDate !== today) {
      user.streak = 1; // restart
    }
    user.lastActiveDate = today;

    // ── Pomodoro counters ──
    user.pomodorosTotal += 1;
    user.pomodorosToday += 1;

    // ── XP ──
    const baseXP = 50;
    let bonusXP = 0;
    let dailyGoalHit = false;

    // Daily goal bonus (4 pomodoros → +200 XP, only once per day)
    if (user.pomodorosToday === 4) {
      bonusXP = 200;
      dailyGoalHit = true;
    }

    user.xp += baseXP + bonusXP;
    user.level = Math.floor(user.xp / 100);

    // ── Badge checks ──
    const earned = [];
    const check = (id) => {
      if (!user.badges.includes(id)) {
        user.badges.push(id);
        earned.push(BADGES[id]);
      }
    };

    if (user.pomodorosTotal === 1)  check('first_pom');
    if (user.streak >= 3)           check('streak_3');
    if (user.streak >= 7)           check('streak_7');
    if (user.streak >= 30)          check('streak_30');
    if (dailyGoalHit)               check('mind_master');
    if (user.pomodorosTotal >= 50)  check('pom_50');
    if (user.pomodorosTotal >= 100) check('pom_100');
    if (user.xp >= 1000)            check('xp_1000');
    if (user.xp >= 5000)            check('xp_5000');

    await user.save();

    // ── Save session record ──
    const session = await Session.create({
      user: user._id,
      room: room || 'study',
      roomName: roomName || 'Study Room',
      durationMinutes: durationMinutes || 25,
      xpEarned: baseXP + bonusXP,
      pomodorosCompleted: 1,
      dailyGoalHit
    });

    res.json({
      success: true,
      xpEarned: baseXP + bonusXP,
      dailyGoalHit,
      badgesEarned: earned,
      user: {
        xp: user.xp,
        level: user.level,
        pomodorosTotal: user.pomodorosTotal,
        pomodorosToday: user.pomodorosToday,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (err) {
    console.error('Session complete error:', err);
    res.status(500).json({ success: false, message: 'Could not record session.' });
  }
});

// ─── GET /api/sessions/history ────────────────────────────────────────────
// Last 50 sessions for the logged-in user
router.get('/history', async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch history.' });
  }
});

// ─── GET /api/sessions/stats ──────────────────────────────────────────────
// Aggregated stats for profile dashboard
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [agg] = await Session.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalXP: { $sum: '$xpEarned' },
          totalMinutes: { $sum: '$durationMinutes' },
          dailyGoalsHit: { $sum: { $cond: ['$dailyGoalHit', 1, 0] } }
        }
      }
    ]);

    const user = req.user;
    res.json({
      success: true,
      stats: {
        totalSessions: agg?.totalSessions || 0,
        totalXP: agg?.totalXP || user.xp,
        totalMinutes: agg?.totalMinutes || 0,
        dailyGoalsHit: agg?.dailyGoalsHit || 0,
        streak: user.streak,
        level: user.level,
        badges: user.badges,
        pomodorosToday: user.pomodorosToday
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
});

module.exports = router;
