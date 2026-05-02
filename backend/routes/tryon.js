const express = require("express");
const Replicate = require("replicate");
const { requireAuth } = require("../middleware/auth");
const { getUserByAuth0UserId } = require("../db/userService");

const router = express.Router();
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

router.post("/", requireAuth, async (req, res) => {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN is not configured" });
    }

    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { humanImageUrl, garmentImageUrl, category } = req.body;

    if (!humanImageUrl) return res.status(400).json({ error: "humanImageUrl is required" });
    if (!garmentImageUrl) return res.status(400).json({ error: "garmentImageUrl is required" });
    if (!category) return res.status(400).json({ error: "category is required" });

    const validCategories = ["upper_body", "lower_body", "dresses"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "category must be one of: upper_body, lower_body, dresses" });
    }

    const prediction = await replicate.predictions.create({
      version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      input: {
        human_img: humanImageUrl,
        garm_img: garmentImageUrl,
        garment_des: category,
        category,
        crop: false,
        seed: 42,
        steps: 30,
        force_dc: false,
      },
    });

    const result = await replicate.wait(prediction);
    res.json({ success: true, imageUrl: result.output });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;