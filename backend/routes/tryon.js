const express = require("express");
const Replicate = require("replicate");
const { requireAuth } = require("../middleware/auth");
const { getUserByAuth0UserId } = require("../db/userService");
const Outfit = require("../models/Outfit");
const { uploadImageUrlToCloudinary } = require("../lib/cloudinary");

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

    const { humanImageUrl, outfitId } = req.body;

    if (!humanImageUrl) return res.status(400).json({ error: "humanImageUrl is required" });
    if (!outfitId) return res.status(400).json({ error: "outfitId is required" });

    const outfit = await Outfit.findById(outfitId).populate("items");
    if (!outfit) return res.status(404).json({ error: "Outfit not found" });
    if (outfit.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const garmentImageUrls = outfit.items.map(item => item.imageUrls?.front).filter(Boolean);
    if (garmentImageUrls.length === 0) {
      return res.status(400).json({ error: "No garment images found in this outfit" });
    }

    const clothingDescription = outfit.items
      .map((item) => `${item.name} (${item.category})`)
      .join(", ");

    const output = await replicate.run("openai/gpt-image-2", {
      input: {
        prompt: `Virtual try-on: dress the person in Image 1 in the clothing shown in the remaining reference images (${clothingDescription}). Preserve the person's face, skin tone, hair, and body shape exactly. Show the full outfit worn together naturally.`,
        input_images: [humanImageUrl, ...garmentImageUrls],
        quality: "low",
        aspect_ratio: "1:1",
        number_of_images: 1,
      },
    });

    const rawUrl = Array.isArray(output) ? output[0] : output;
    const imageUrl = typeof rawUrl?.url === "function" ? rawUrl.url() : String(rawUrl);
    const storedImageUrl = await uploadImageUrlToCloudinary(imageUrl, "tryon-previews");

    outfit.lastTryOnPreviewUrl = storedImageUrl;
    await outfit.save();

    res.json({ success: true, imageUrl: storedImageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
