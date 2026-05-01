const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  auth0UserId: { type: String, required: true, unique: true },
  name: { type: String, required: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  bodyProfile: {
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    bodyType: String,
  },
  stylePreferences: [String],
  profilePhoto: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
