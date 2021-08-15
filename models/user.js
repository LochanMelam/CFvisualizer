const mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  verified: Boolean,
});
module.exports = mongoose.model("user", userSchema);
