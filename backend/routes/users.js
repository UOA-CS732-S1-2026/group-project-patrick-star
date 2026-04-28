const express = require("express");
const {
  addUser,
  getUser,
  getUserByEmail,
  getUserByAuth0UserId,
  updateUser,
  deleteUser,
} = require("../db/userService");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.post("/me/sync", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const existingUser = await getUserByAuth0UserId(auth0UserId);

    if (existingUser) {
      return res.json(existingUser);
    }

    const newUser = await addUser({
      auth0UserId,
      name: req.auth.payload.name,
      email: req.auth.payload.email,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
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

router.put("/me", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const existingUser = await getUserByAuth0UserId(auth0UserId);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await updateUser(existingUser._id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/me/photo", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const existingUser = await getUserByAuth0UserId(auth0UserId);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { profilePhoto } = req.body;
    if (!profilePhoto) {
      return res.status(400).json({ error: "profilePhoto is required" });
    }
    const user = await updateUser(existingUser._id, { profilePhoto });
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

router.delete("/me", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const existingUser = await getUserByAuth0UserId(auth0UserId);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await deleteUser(existingUser._id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
