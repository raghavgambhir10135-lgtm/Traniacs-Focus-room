const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// In-memory active users per room (resets on server restart)
// For production, use Redis
const activeRooms = {
  study: new Set(),
  meditate: new Set(),
  yoga: new Set(),
  read: new Set(),
  interact: new Set(),
  music: new Set()
};

// POST /api/rooms/join
router.post('/join', protect, async (req, res) => {
  try {
    const { roomType } = req.body;
    if (!activeRooms[roomType]) {
      return res.status(400).json({ success: false, message: 'Invalid room type.' });
    }

    activeRooms[roomType].add(req.user._id.toString());

    // Increment room visits
    await User.findByIdAndUpdate(req.user._id, { $inc: { roomVisits: 1 } });

    // Get last 20 chat messages for this room
    const messages = await ChatMessage.find({ roomType })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      activeCount: activeRooms[roomType].size,
      recentMessages: messages.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rooms/leave
router.post('/leave', protect, async (req, res) => {
  try {
    const { roomType } = req.body;
    if (activeRooms[roomType]) {
      activeRooms[roomType].delete(req.user._id.toString());
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms/stats — active user counts for all rooms
router.get('/stats', async (req, res) => {
  try {
    const stats = {};
    for (const [room, users] of Object.entries(activeRooms)) {
      stats[room] = users.size;
    }
    const totalActive = Object.values(activeRooms).reduce((sum, s) => sum + s.size, 0);
    res.json({ success: true, rooms: stats, totalActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rooms/chat — send a chat message in a room
router.post('/chat', protect, async (req, res) => {
  try {
    const { roomType, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }
    if (message.length > 500) {
      return res.status(400).json({ success: false, message: 'Message too long (max 500 chars).' });
    }

    const chatMsg = await ChatMessage.create({
      roomType,
      userId: req.user._id,
      userName: req.user.name,
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: {
        id: chatMsg._id,
        userName: chatMsg.userName,
        message: chatMsg.message,
        createdAt: chatMsg.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms/:roomType/messages — get recent messages
router.get('/:roomType/messages', protect, async (req, res) => {
  try {
    const { roomType } = req.params;
    const messages = await ChatMessage.find({ roomType })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
