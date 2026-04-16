const mongoose = require('mongoose')

const ClothingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  
  name: { type: String, required: true,  minlegth: 1, maxlength: 30},
  category: { type: String, required: true, enum: ['top', 'bottom', 'outerwear', 'footwear', 'accessory'] },
  size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  colour: { type: String, required: true },
  fit: { type: String, required: true, enum: ['tight', 'regular', 'loose'] },
  imageUrls: {
    front: String,
    back: String,
    side: String
  }
})

module.exports = mongoose.model('ClothingItem', ClothingItemSchema)