// Load backend-specific environment variables even when the app is started from the monorepo root.
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const ClothingItemsRoutes = require("./routes/clothingItems");
const UsersRoutes = require("./routes/users");
const TryOnRoutes = require("./routes/tryon");
const OutfitsRoutes = require("./routes/outfits");

// Shared middleware and route mounts for the REST API.
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/clothingItems", ClothingItemsRoutes);
app.use("/api/users", UsersRoutes);
app.use("/api/tryon", TryOnRoutes);
app.use("/api/outfits", OutfitsRoutes);

// MongoDB Connection
const isJest = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID;

if (!isJest) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB successfully connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;
