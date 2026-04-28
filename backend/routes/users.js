const express = require("express");
const {
  addUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require("../db/userService");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const user = await addUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.errors) {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    res.json({
      message: "Authenticated user",
      auth: {
        sub: req.auth.payload.sub,
        iss: req.auth.payload.iss,
        aud: req.auth.payload.aud,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id/photo", async (req, res) => {
  try {
    const { profilePhoto } = req.body;
    if (!profilePhoto) {
      return res.status(400).json({ error: "profilePhoto is required" });
    }
    const user = await updateUser(req.params.id, { profilePhoto });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "Profile photo updated successfully",
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
