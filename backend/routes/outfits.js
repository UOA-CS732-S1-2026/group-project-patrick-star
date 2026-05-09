const express = require("express");
const {
  addOutfit,
  getOutfits,
  updateOutfitForUser,
  deleteOutfitForUser,
} = require("../db/outfitService");
const ClothingItem = require("../models/ClothingItems");
const { requireAuth } = require("../middleware/auth");
const { getUserByAuth0UserId } = require("../db/userService");

const router = express.Router();

async function getAuthenticatedUser(req, res) {
  const auth0UserId = req.auth.payload.sub;
  const user = await getUserByAuth0UserId(auth0UserId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  return user;
}

async function validateOwnedItems(userId, itemIds = []) {
  const uniqueItemIds = [...new Set(itemIds.map(String))];
  const items = await ClothingItem.find({
    _id: { $in: uniqueItemIds },
    userId,
  });

  if (items.length !== uniqueItemIds.length) {
    const error = new Error("One or more items were not found");
    error.statusCode = 404;
    throw error;
  }

  return uniqueItemIds;
}

router.post("/me", requireAuth, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const items = await validateOwnedItems(user._id, req.body.items || []);
    const outfit = await addOutfit({
      name: req.body.name,
      items,
      userId: user._id,
      style: req.body.style ?? "",
      favourite: req.body.favourite ?? false,
    });

    const [populatedOutfit] = await getOutfits({
      userId: user._id,
      outfitId: outfit._id,
    });

    res.status(201).json(populatedOutfit);
  } catch (error) {
    if (error.errors) {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }

    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const outfits = await getOutfits({ userId: user._id });
    res.json(outfits);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/me/:id", requireAuth, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const update = {};

    if (Object.hasOwn(req.body, "name")) update.name = req.body.name;
    if (Object.hasOwn(req.body, "style")) update.style = req.body.style;
    if (Object.hasOwn(req.body, "favourite")) update.favourite = req.body.favourite;
    if (req.body.items) {
      update.items = await validateOwnedItems(user._id, req.body.items);
    }

    const outfit = await updateOutfitForUser(req.params.id, user._id, update);
    if (!outfit) {
      return res.status(404).json({ error: "Outfit not found" });
    }

    res.json(outfit);
  } catch (error) {
    if (error.errors) {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }

    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.delete("/me/:id", requireAuth, async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const outfit = await deleteOutfitForUser(req.params.id, user._id);
    if (!outfit) {
      return res.status(404).json({ error: "Outfit not found" });
    }

    res.json({ message: "Outfit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
