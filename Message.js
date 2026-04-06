const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  text: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Keep only last 200 messages per room (TTL-style cleanup handled in route)
module.exports = mongoose.model('Message', messageSchema);
