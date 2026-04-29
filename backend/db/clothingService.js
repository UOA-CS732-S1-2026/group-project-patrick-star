const ClothingItem = require("../models/ClothingItems");

const addItem = (data) => ClothingItem.create(data);
const getItems = (userId) => ClothingItem.find({ userId });
const updateItemForUser = (id, userId, data) =>
  ClothingItem.findOneAndUpdate({ _id: id, userId }, data, {
    returnDocument: "after",
  });

const deleteItemForUser = (id, userId) =>
  ClothingItem.findOneAndDelete({ _id: id, userId });

module.exports = { addItem, getItems, updateItemForUser, deleteItemForUser };
