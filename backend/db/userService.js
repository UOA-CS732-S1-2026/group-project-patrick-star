const User = require("../models/User");

const addUser = (data) => User.create(data);
const getUser = (id) => User.findById(id);
const getUserByEmail = (email) => User.findOne({ email });
const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true });
const deleteUser = (id) => User.findByIdAndDelete(id);

module.exports = { addUser, getUser, getUserByEmail, updateUser, deleteUser };
