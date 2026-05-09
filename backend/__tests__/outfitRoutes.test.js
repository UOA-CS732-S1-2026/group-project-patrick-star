const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");
const ClothingItem = require("../models/ClothingItems");
const Outfit = require("../models/Outfit");

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
  await Outfit.deleteMany({});
  await ClothingItem.deleteMany({});
  await User.deleteMany({
    $or: [{ auth0UserId: "auth0|test-user" }, { email: "jane@example.com" }],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/outfits/me", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app).post("/api/outfits/me");
    expect(res.status).toBe(401);
  });

  it("should create an outfit for the authenticated user", async () => {
    const user = await createTestUser();
    const top = await createTestItem(user._id, { category: "upper_body" });
    const pants = await createTestItem(user._id, { category: "lower_body" });

    const res = await request(app)
      .post("/api/outfits/me")
      .set(authHeader)
      .send({
        name: "Weekend Fit",
        items: [top._id, pants._id],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Weekend Fit");
    expect(res.body.userId).toBe(String(user._id));
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].name).toBeDefined();
  });

  it("should reject clothing items owned by another user", async () => {
    await createTestUser();
    const otherItem = await createTestItem(new mongoose.Types.ObjectId());

    const res = await request(app)
      .post("/api/outfits/me")
      .set(authHeader)
      .send({
        name: "Borrowed Fit",
        items: [otherItem._id],
      });

    expect(res.status).toBe(404);
  });

  it("should update style and favourite independently", async () => {
    const user = await createTestUser();
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Plain Fit",
      items: [],
      style: "",
      favourite: false,
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ style: "Smart", favourite: true });

    expect(res.status).toBe(200);
    expect(res.body.style).toBe("Smart");
    expect(res.body.favourite).toBe(true);
    expect(res.body.name).toBe("Plain Fit");
  });
});

describe("GET /api/outfits/me", () => {
  it("should return outfits for the authenticated user", async () => {
    const user = await createTestUser();
    await Outfit.create({ userId: user._id, name: "Owned Fit", items: [] });
    await Outfit.create({
      userId: new mongoose.Types.ObjectId(),
      name: "Someone Else",
      items: [],
    });

    const res = await request(app).get("/api/outfits/me").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Owned Fit");
  });

  it("should return 404 when user profile not found", async () => {
    const res = await request(app).get("/api/outfits/me").set(authHeader);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/outfits/me/:id", () => {
  it("should update an outfit owned by the authenticated user", async () => {
    const user = await createTestUser();
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Old Fit",
      items: [],
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ name: "Updated Fit" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Fit");
    expect(res.body.userId).toBe(String(user._id));
  });

  it("should update outfit items only when the items belong to the authenticated user", async () => {
    const user = await createTestUser();
    const top = await createTestItem(user._id);
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Empty Fit",
      items: [],
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ items: [top._id] });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]._id).toBe(String(top._id));
  });

  it("should return 404 when updating another user's outfit", async () => {
    await createTestUser();
    const outfit = await Outfit.create({
      userId: new mongoose.Types.ObjectId(),
      name: "Other Fit",
      items: [],
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ name: "Updated Fit" });

    expect(res.status).toBe(404);
  });

  it("should reject replacing outfit items with another user's item", async () => {
    const user = await createTestUser();
    const otherItem = await createTestItem(new mongoose.Types.ObjectId());
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Owned Fit",
      items: [],
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ items: [otherItem._id] });

    expect(res.status).toBe(404);
  });

  it("should update style and favourite independently", async () => {
    const user = await createTestUser();
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Plain Fit",
      items: [],
      style: "",
      favourite: false,
    });

    const res = await request(app)
      .put(`/api/outfits/me/${outfit._id}`)
      .set(authHeader)
      .send({ style: "Smart", favourite: true });

    expect(res.status).toBe(200);
    expect(res.body.style).toBe("Smart");
    expect(res.body.favourite).toBe(true);
    expect(res.body.name).toBe("Plain Fit");
  });
});

describe("DELETE /api/outfits/me/:id", () => {
  it("should delete an outfit owned by the authenticated user", async () => {
    const user = await createTestUser();
    const outfit = await Outfit.create({
      userId: user._id,
      name: "Delete Fit",
      items: [],
    });

    const res = await request(app)
      .delete(`/api/outfits/me/${outfit._id}`)
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Outfit deleted successfully");

    const deleted = await Outfit.findById(outfit._id);
    expect(deleted).toBeNull();
  });

  it("should return 404 when deleting another user's outfit", async () => {
    await createTestUser();
    const outfit = await Outfit.create({
      userId: new mongoose.Types.ObjectId(),
      name: "Other Fit",
      items: [],
    });

    const res = await request(app)
      .delete(`/api/outfits/me/${outfit._id}`)
      .set(authHeader);

    expect(res.status).toBe(404);
  });
});
