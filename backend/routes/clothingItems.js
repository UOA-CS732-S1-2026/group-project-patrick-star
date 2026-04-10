const express = require("express");
const {
  addItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../db/clothingService");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const item = await addItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ errors: messages });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const item = await getItems(req.params.userId);
    if (!item) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await updateItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await deleteItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
