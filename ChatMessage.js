const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomType: {
    type: String,
    enum: ['study', 'meditate', 'yoga', 'read', 'interact', 'music'],
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  message: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // auto-delete after 24h
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
