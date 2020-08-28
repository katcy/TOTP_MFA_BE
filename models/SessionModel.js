const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  username: String,
});

const sessionModel = mongoose.model("SessionModel", sessionSchema);

module.exports = sessionModel;
