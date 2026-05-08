const Outfit = require("../models/Outfit");

const addOutfit = (data) => Outfit.create(data);

async function getOutfits({ userId, outfitId }) {
  const filter = {};

  if (userId) filter.userId = userId;
  if (outfitId) filter._id = outfitId;

  return Outfit.find(filter).populate("items");
}

const updateOutfitForUser = (id, userId, data) =>
  Outfit.findOneAndUpdate({ _id: id, userId }, data, {
    returnDocument: "after",
    runValidators: true,
  }).populate("items");

const deleteOutfitForUser = (id, userId) =>
  Outfit.findOneAndDelete({ _id: id, userId });

const addItemToOutfit = (outfitId, userId, itemId) =>
  Outfit.findOneAndUpdate(
    { _id: outfitId, userId },
    { $push: { items: itemId } },
    { returnDocument: "after" }
  ).populate("items");

const removeItemFromOutfit = (outfitId, userId, itemId) =>
  Outfit.findOneAndUpdate(
    { _id: outfitId, userId },
    { $pull: { items: itemId } },
    { returnDocument: "after" }
  ).populate("items");

module.exports = {
  addOutfit,
  getOutfits,
  updateOutfitForUser,
  deleteOutfitForUser,
  addItemToOutfit,
  removeItemFromOutfit,
};
