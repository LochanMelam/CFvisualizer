const mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  verified: Boolean,
});
module.exports = mongoose.model("user", userSchema);
