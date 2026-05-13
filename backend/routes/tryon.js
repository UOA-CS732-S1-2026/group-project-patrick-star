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

// Generate and persist a virtual try-on preview for an owned outfit.
router.post("/", requireAuth, async (req, res) => {
  try {
    // Fail early with a configuration error before doing any database or provider work.
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "REPLICATE_API_TOKEN is not configured" });
    }

    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // The model image and target outfit are both required to build the Replicate input.
    const { humanImageUrl, outfitId } = req.body;

    if (!humanImageUrl) return res.status(400).json({ error: "humanImageUrl is required" });
    if (!outfitId) return res.status(400).json({ error: "outfitId is required" });

    // Load outfit items so their image URLs and labels can be passed to the image model.
    const outfit = await Outfit.findById(outfitId).populate("items");
    if (!outfit) return res.status(404).json({ error: "Outfit not found" });
    if (outfit.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Replicate receives the user model first, followed by each available front-facing garment image.
    const garmentImageUrls = outfit.items.map(item => item.imageUrls?.front).filter(Boolean);
    if (garmentImageUrls.length === 0) {
      return res.status(400).json({ error: "No garment images found in this outfit" });
    }

    // Include item names and categories in the prompt so the generated preview reflects the full outfit.
    const clothingDescription = outfit.items
      .map((item) => `${item.name} (${item.category})`)
      .join(", ");

    // Ask Replicate to compose the outfit from the model image plus garment references.
    const output = await replicate.run("openai/gpt-image-2", {
      input: {
        prompt: `Virtual try-on: dress the person in Image 1 in the clothing shown in the remaining reference images (${clothingDescription}). Preserve the person's face, skin tone, hair, and body shape exactly. Show the full outfit worn together naturally.`,
        input_images: [humanImageUrl, ...garmentImageUrls],
        quality: "low",
        aspect_ratio: "1:1",
        number_of_images: 1,
      },
    });

    // Replicate may return a string URL or an object with url(); normalize both shapes before storing.
    const rawUrl = Array.isArray(output) ? output[0] : output;
    const imageUrl = String(
      typeof rawUrl?.url === "function" ? rawUrl.url() : rawUrl,
    );
    const storedImageUrl = await uploadImageUrlToCloudinary(imageUrl, "tryon-previews");

    // Save the latest preview URL on the outfit so it can be shown without regenerating.
    outfit.lastTryOnPreviewUrl = storedImageUrl;
    await outfit.save();

    res.json({ success: true, imageUrl: storedImageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
