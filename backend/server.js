// backend/server.js
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Keep network binding separate from app setup so tests can import the Express app without listening.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
