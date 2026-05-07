require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const ClothingItemsRoutes = require("./routes/clothingItems");
const UsersRoutes = require("./routes/users");
const TryOnRoutes = require("./routes/tryon");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/clothingItems", ClothingItemsRoutes);
app.use("/api/users", UsersRoutes);
app.use("/api/tryon", TryOnRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;
