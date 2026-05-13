const mongoose = require('mongoose')

// Outfits belong to a user and contain references to clothing items already in that user's closet.
const OutfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true, minlength: 1, maxlength: 50 },
  // Store item references instead of snapshots so outfit cards always show current closet data.
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem' }],
  style: { type: String, default: '' },
  favourite: { type: Boolean, default: false },
  lastTryOnPreviewUrl: { type: String, default: null },
})

// Keep outfit combinations realistic by allowing only one item per clothing category.
OutfitSchema.pre('save', async function () {
  if (this.items.length === 0) return

  const ClothingItem = mongoose.model('ClothingItem')
  const items = await ClothingItem.find({ _id: { $in: this.items } }).select('category')

  const categories = items.map(item => item.category)
  const uniqueCategories = new Set(categories)

  if (categories.length !== uniqueCategories.size) {
    throw new Error('Outfit items must be from different categories')
  }
})

module.exports = mongoose.model('Outfit', OutfitSchema)
