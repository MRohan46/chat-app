const mongoose = require("mongoose");

const emailOpenSchema = new mongoose.Schema({
  email: String,
  ip: String,
  userAgent: String,
  emailClient: String,
  country: String,
  city: String,
  region: String,
  org: String,
  openedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmailOpen", emailOpenSchema);
