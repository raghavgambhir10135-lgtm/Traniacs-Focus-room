const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  outletId: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", required: true },
  user: { type: String, default: "Anonymous" },
  comment: String,
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);
