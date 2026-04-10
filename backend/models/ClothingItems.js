const mongoose = require('mongoose')

const ClothingItemSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  category: String,
  size: String,
  colour: String,
  fit: String,
  imageUrls: {
    front: String,
    back: String,
    side: String
  }
})

module.exports = mongoose.model('ClothingItem', ClothingItemSchema)