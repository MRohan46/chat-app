const mongoose = require("mongoose");

const clickLogSchema = new mongoose.Schema({
  email: String,
  url: String,
  ip: String,
  clickedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ClickLog", clickLogSchema);
