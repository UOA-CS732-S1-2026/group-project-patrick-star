const ClothingItem = require('../models/ClothingItems')

const addItem = (data) => ClothingItem.create(data)

async function getItems({ userId, category, size, colour, fit }) {
  const filter = {};

  if (userId) filter.userId = userId;
  if (category) filter.category = category;
  if (size) filter.size = size;
  if (colour) filter.colour = colour;
  if (fit) filter.fit = fit;

  return ClothingItem.find(filter);
}

const updateItem = (id, data) => ClothingItem.findByIdAndUpdate(id, data, { new: true })
const deleteItem = (id) => ClothingItem.findByIdAndDelete(id)

module.exports = { addItem, getItems, updateItem, deleteItem }