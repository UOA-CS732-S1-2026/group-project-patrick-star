const mongoose = require('mongoose')

const OutfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  
  name: { type: String, required: true, minlength: 1, maxlength: 50 },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem' }]
})

// Custom validation to ensure items are from different categories
OutfitSchema.pre('save', async function(next) {
  if (this.items.length === 0) return next()
  
  const ClothingItem = mongoose.model('ClothingItem')
  const items = await ClothingItem.find({ _id: { $in: this.items } }).select('category')
  
  const categories = items.map(item => item.category)
  const uniqueCategories = new Set(categories)
  
  if (categories.length !== uniqueCategories.size) {
    return next(new Error('Outfit items must be from different categories'))
  }
  
  next()
})

module.exports = mongoose.model('Outfit', OutfitSchema)