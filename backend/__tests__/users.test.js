const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");

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

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany({
    $or: [{ auth0UserId: "auth0|test-user" }, { email: "jane@example.com" }],
  });
});

afterAll(async () => {
  // await mongoose.connection.dropCollection("users");
  await mongoose.disconnect();
});

// Create user
describe("POST /api/users/me/sync", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app).post("/api/users/me/sync");

    expect(res.status).toBe(401);
  });

  it("should sync a new authenticated user", async () => {
    const res = await request(app)
      .post("/api/users/me/sync")
      .set(authHeader)
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        bodyProfile: {
          height: 165,
          weight: 60,
          bodyType: "ectomorph",
        },
        stylePreferences: ["casual", "minimal"],
      });

    expect(res.status).toBe(201);
    expect(res.body.auth0UserId).toBe("auth0|test-user");
  });

  it("should sync a user with required profile fields", async () => {
    const res = await request(app)
      .post("/api/users/me/sync")
      .set(authHeader)
      .send({ name: "Jane Doe", email: "jane@example.com" });

    expect(res.status).toBe(201);
  });
});

// Get
describe("GET /api/users/me", () => {
  it("should return the authenticated user's profile", async () => {
    await createTestUser();
    const res = await request(app).get("/api/users/me").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.auth0UserId).toBe("auth0|test-user");
  });

  it("should return 404 when authenticated profile does not exist", async () => {
    const res = await request(app).get("/api/users/me").set(authHeader);

    expect(res.status).toBe(404);
  });
});

// Update user
describe("PUT /api/users/me", () => {
  it("should update a user and return updated data", async () => {
    await createTestUser();
    const res = await request(app)
      .put("/api/users/me")
      .set(authHeader)
      .send({ name: "Jane Updated", stylePreferences: ["streetwear"] });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Jane Updated");
    expect(res.body.stylePreferences).toContain("streetwear");
  });

  it("should return 404 for a non-existent user", async () => {
    const res = await request(app)
      .put("/api/users/me")
      .set(authHeader)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// Upload profile photo
describe("PUT /api/users/me/photo", () => {
  it("should upload a profile photo and return success", async () => {
    await createTestUser();
    const res = await request(app)
      .put("/api/users/me/photo")
      .set(authHeader)
      .send({ profilePhoto: "https://example.com/photo.jpg" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile photo updated successfully");
    expect(res.body.profilePhoto).toBe("https://example.com/photo.jpg");
  });

  it("should return 400 when profilePhoto is missing", async () => {
    await createTestUser();
    const res = await request(app)
      .put("/api/users/me/photo")
      .set(authHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("profilePhoto is required");
  });

  it("should return 404 for a non-existent user", async () => {
    const res = await request(app)
      .put("/api/users/me/photo")
      .set(authHeader)
      .send({ profilePhoto: "https://example.com/photo.jpg" });

    expect(res.status).toBe(404);
  });
});

// Delete user
describe("DELETE /api/users/me", () => {
  it("should delete a user and return success message", async () => {
    await createTestUser();
    const res = await request(app).delete("/api/users/me").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  it("should return 404 for already deleted user", async () => {
    const res = await request(app).delete("/api/users/me").set(authHeader);

    expect(res.status).toBe(404);
  });
});
