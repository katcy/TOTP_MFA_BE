const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  totpKey: String,
  totpUrl: String,
  totpVerified: Boolean,
});

const userModel = mongoose.model("UserModel", userSchema);

module.exports = userModel;
