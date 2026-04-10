const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  bodyProfile: {
    height: Number,
    weight: Number,
    bodyType: String
  },
  stylePreferences: [String]
})

module.exports = mongoose.model('User', UserSchema)