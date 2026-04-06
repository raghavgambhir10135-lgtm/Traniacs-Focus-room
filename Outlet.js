const mongoose = require("mongoose");

const outletSchema = new mongoose.Schema({
  name: String,
  campus: String,
  menu: [{ item: String, price: Number }]
});

module.exports = mongoose.model("Outlet", outletSchema);
