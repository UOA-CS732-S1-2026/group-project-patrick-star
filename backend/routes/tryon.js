const express = require("express");
const Replicate = require("replicate");

const router = express.Router();
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

router.post("/", async (req, res) => {
  try {
    const { humanImageBase64, garmentImageBase64, category } = req.body;

    if (!humanImageBase64) {
      return res.status(400).json({ error: "humanImageBase64 is required" });
    }
    if (!garmentImageBase64) {
      return res.status(400).json({ error: "garmentImageBase64 is required" });
    }
    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    const validCategories = ["upper_body", "lower_body", "dresses"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: "category must be one of: upper_body, lower_body, dresses",
      });
    }

    const output = await replicate.run("cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985", {
      input: {
        human_img: humanImageBase64,
        garm_img: garmentImageBase64,
        category: category,
        steps: 30,
      },
    });

    res.json({ success: true, imageUrl: output });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;