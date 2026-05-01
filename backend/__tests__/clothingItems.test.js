const request = require("supertest");
const mongoose = require("mongoose");
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
    colour: "black",
    fit: "regular",
    imageUrls: {
      front: "",
      back: "",
      side: "",
    },
    ...overrides,
  });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await ClothingItem.deleteMany({});
  await User.deleteMany({
    $or: [{ auth0UserId: "auth0|test-user" }, { email: "jane@example.com" }],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/clothingItems/me", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app).post("/api/clothingItems/me");

    expect(res.status).toBe(401);
  });

  it("should create a clothing item for the authenticated user", async () => {
    const user = await createTestUser();

    const res = await request(app)
      .post("/api/clothingItems/me")
      .set(authHeader)
      .send({
        name: "Tshirt",
        category: "upper_body",
        size: "M",
        colour: "black",
        fit: "regular",
        imageUrls: {
          front: "",
          back: "",
          side: "",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Tshirt");
    expect(res.body.userId).toBe(String(user._id));
  });

  it("should return 404 when the authenticated user has no profile", async () => {
    const res = await request(app)
      .post("/api/clothingItems/me")
      .set(authHeader)
      .send({
        name: "Tshirt",
        category: "upper_body",
        size: "M",
        colour: "black",
        fit: "regular",
      });

    expect(res.status).toBe(404);
  });

  it("should return 400 for missing required item fields", async () => {
    await createTestUser();

    const res = await request(app)
      .post("/api/clothingItems/me")
      .set(authHeader)
      .send({ name: "Jacket" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/clothingItems/me", () => {
  it("should return clothing items for the authenticated user", async () => {
    const user = await createTestUser();
    await createTestItem(user._id);

    const res = await request(app).get("/api/clothingItems/me").set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe(String(user._id));
  });

  it("should return an empty array when the authenticated user has no items", async () => {
    await createTestUser();

    const res = await request(app).get("/api/clothingItems/me").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return 404 when the authenticated user has no profile", async () => {
    const res = await request(app).get("/api/clothingItems/me").set(authHeader);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/clothingItems/me/:id", () => {
  it("should update an owned clothing item", async () => {
    const user = await createTestUser();
    const item = await createTestItem(user._id);

    const res = await request(app)
      .put(`/api/clothingItems/me/${item._id}`)
      .set(authHeader)
      .send({ name: "Hoodie", colour: "blue" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Hoodie");
    expect(res.body.colour).toBe("blue");
  });

  it("should return 404 when updating another user's item", async () => {
    await createTestUser();
    const otherUserId = new mongoose.Types.ObjectId();
    const item = await createTestItem(otherUserId);

    const res = await request(app)
      .put(`/api/clothingItems/me/${item._id}`)
      .set(authHeader)
      .send({ name: "Hoodie" });

    expect(res.status).toBe(404);
  });

  it("should return 404 when the authenticated user has no profile", async () => {
    const itemId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/clothingItems/me/${itemId}`)
      .set(authHeader)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/clothingItems/me/:id", () => {
  it("should delete an owned clothing item", async () => {
    const user = await createTestUser();
    const item = await createTestItem(user._id);

    const res = await request(app)
      .delete(`/api/clothingItems/me/${item._id}`)
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item deleted successfully");
  });

  it("should return 404 when deleting another user's item", async () => {
    await createTestUser();
    const otherUserId = new mongoose.Types.ObjectId();
    const item = await createTestItem(otherUserId);

    const res = await request(app)
      .delete(`/api/clothingItems/me/${item._id}`)
      .set(authHeader);

    expect(res.status).toBe(404);
  });

  it("should return 404 when deleting an already deleted item", async () => {
    const user = await createTestUser();
    const item = await createTestItem(user._id);

    await request(app).delete(`/api/clothingItems/me/${item._id}`).set(authHeader);

    const res = await request(app)
      .delete(`/api/clothingItems/me/${item._id}`)
      .set(authHeader);

    expect(res.status).toBe(404);
  });
});
