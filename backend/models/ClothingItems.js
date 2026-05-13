const mongoose = require('mongoose')

const ClothingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

  name: { type: String, required: true, minlength: 1, maxlength: 30 },
  category: { type: String, required: true, enum: ['upper_body', 'lower_body', 'dresses', 'outerwear', 'shoes', 'accessories'] },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: function () {
      return this.category !== 'shoes'
    },
  },
  fit: { type: String, required: true, enum: ['tight', 'regular', 'loose'] },
  favourite: { type: Boolean, default: false },
  imageUrls: {
    front: String,
    back: String,
    side: String
  }
})

module.exports = mongoose.model('ClothingItem', ClothingItemSchema)
