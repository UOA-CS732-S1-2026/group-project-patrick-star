const ClothingItem = require('../models/ClothingItems')

const addItem = (data) => ClothingItem.create(data)
const getItems = (userId) => ClothingItem.find({ userId })
const updateItem = (id, data) => ClothingItem.findByIdAndUpdate(id, data, { new: true })
const deleteItem = (id) => ClothingItem.findByIdAndDelete(id)

module.exports = { addItem, getItems, updateItem, deleteItem }