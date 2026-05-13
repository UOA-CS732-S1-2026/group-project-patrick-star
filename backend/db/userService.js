const User = require("../models/User");

// Thin data-access helpers keep route handlers focused on HTTP validation and responses.
const addUser = (data) => User.create(data);
const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
const deleteUser = (id) => User.findByIdAndDelete(id);
const getUserByAuth0UserId = (auth0UserId) => User.findOne({ auth0UserId });

module.exports = {
  addUser,
  getUserByAuth0UserId,
  updateUser,
  deleteUser,
};
