const ClothingItem = require("../models/ClothingItems");

const addItem = (data) => ClothingItem.create(data)

async function getItems({ userId, category, size, fit }) {
  const filter = {};

  if (userId) filter.userId = userId;
  if (category) filter.category = category;
  if (size) filter.size = size;
  if (fit) filter.fit = fit;

  return ClothingItem.find(filter);
}

const updateItemForUser = (id, userId, data) =>
  ClothingItem.findOneAndUpdate({ _id: id, userId }, data, {
    returnDocument: "after",
  });

const deleteItemForUser = (id, userId) =>
  ClothingItem.findOneAndDelete({ _id: id, userId });

module.exports = { addItem, getItems, updateItemForUser, deleteItemForUser };
