const express = require("express");
const {
  addUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require("../db/userService");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const item = await addUser(req.body);
    res.status(201).json(item);
  } catch (error) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ errors: messages });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const item = await getUserByEmail(req.params.email);
    if (!item) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await getUser(req.params.id);
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
    const item = await updateUser(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await deleteUser(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
