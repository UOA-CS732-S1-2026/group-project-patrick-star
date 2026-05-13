const request = require("supertest");
const User = require("../models/User");
const ClothingItem = require("../models/ClothingItems");

jest.mock("../middleware/auth.js", () => ({
  requireAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.auth = {
      payload: {
        sub: "auth0|test-user",
      },
    };

    next();
  },
}));

const app = require("../app");
const authHeader = { Authorization: "Bearer test-token" };

const createTestUser = () =>
  User.create({
    auth0UserId: "auth0|test-user",
    name: "Jane Doe",
    email: "jane@example.com",
  });

const createTestItem = (userId, overrides = {}) =>
  ClothingItem.create({
    userId,
    name: "Tshirt",
    category: "upper_body",
    size: "M",
    fit: "regular",
    imageUrls: {
      front: "",
      back: "",
      side: "",
    },
    ...overrides,
  });

beforeEach(async () => {
  await ClothingItem.deleteMany({});
  await User.deleteMany({
    $or: [{ auth0UserId: "auth0|test-user" }, { email: "jane@example.com" }],
  });

  const user = await createTestUser();
  await createTestItem(user._id, {
    name: "Black Shirt",
    category: "upper_body",
    size: "M",
    fit: "regular",
  });
  await createTestItem(user._id, {
    name: "Blue Jeans",
    category: "lower_body",
    size: "L",
    fit: "tight",
  });
});

describe("GET /api/clothingItems/me (filters)", () => {
  it("should filter by category", async () => {
    const res = await request(app)
      .get("/api/clothingItems/me")
      .set(authHeader)
      .query({ category: "upper_body" });

    expect(res.status).toBe(200);
    expect(res.body.every((i) => i.category === "upper_body")).toBe(true);
  });

  it("should filter by fit", async () => {
    const res = await request(app)
      .get("/api/clothingItems/me")
      .set(authHeader)
      .query({ fit: "tight" });

    expect(res.status).toBe(200);
    expect(res.body.every((i) => i.fit === "tight")).toBe(true);
  });

  it("should filter by multiple fields", async () => {
    const res = await request(app)
      .get("/api/clothingItems/me")
      .set(authHeader)
      .query({ category: "lower_body", size: "L" });

    expect(res.status).toBe(200);
    expect(
      res.body.every(
        (i) => i.category === "lower_body" && i.size === "L"
      )
    ).toBe(true);
  });
});
