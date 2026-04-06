const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/leaderboard — top 20 users by XP
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name xp level streak badges avatar')
      .sort({ xp: -1 })
      .limit(20);

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      name: u.name,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      badgeCount: u.badges.length,
      avatar: u.avatar
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leaderboard/me — current user's rank
router.get('/me', protect, async (req, res) => {
  try {
    const rank = await User.countDocuments({ xp: { $gt: req.user.xp } });
    res.json({
      success: true,
      rank: rank + 1,
      xp: req.user.xp,
      level: req.user.level
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
