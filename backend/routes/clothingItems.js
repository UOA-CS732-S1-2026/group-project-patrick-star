const express = require("express");
const {
  addItem,
  getItems,
  updateItemForUser,
  deleteItemForUser,
} = require("../db/clothingService");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getUserByAuth0UserId } = require("../db/userService");

router.post("/me", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const item = await addItem({
      ...req.body,
      userId: user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ errors: messages });
  }
});

router.get("/", async (req, res) => {


router.get("/me", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { category, size, colour, fit } = req.query;

    const items = await getItems({ userId: user._id, category, size, colour, fit });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/me/:id", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const item = await updateItemForUser(req.params.id, user._id, req.body);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/me/:id", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const item = await deleteItemForUser(req.params.id, user._id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
