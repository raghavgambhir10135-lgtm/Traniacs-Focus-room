// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  outletId: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", required: true },
  items: [{ item: String, price: Number, quantity: Number }],
  total: Number,
  status: { type: String, default: "Pending" }, // Pending, Accepted, Under Making, Completed
  paymentStatus: { type: String, default: "Pending" }, // Pending, Paid
  transactionId: { type: String }
});

module.exports = mongoose.model("Order", orderSchema);
