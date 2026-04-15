const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

let createdUserId;
let createdUserEmail;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // await mongoose.connection.dropCollection("users");
  await mongoose.disconnect();
});

// Create user
describe("POST /api/users", () => {
  it("should create a new user and return 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secret123",
        bodyProfile: {
          height: 165,
          weight: 60,
          bodyType: "ectomorph",
        },
        stylePreferences: ["casual", "minimal"],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.email).toBe("jane@example.com");
    createdUserId = res.body._id;
    createdUserEmail = res.body.email;
  });

  it("should create user with partial fields", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Partial User" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Partial User");
  });
});

// Get by ID
describe("GET /api/users/:id", () => {
  it("should return a user for a valid id", async () => {
    const res = await request(app).get(`/api/users/${createdUserId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(createdUserId);
  });

  it("should return 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/users/000000000000000000000001");

    expect(res.status).toBe(404);
  });
});

// Get by email
describe("GET /api/users/email/:email", () => {
  it("should return a user for a valid email", async () => {
    const res = await request(app).get(`/api/users/email/${createdUserEmail}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(createdUserEmail);
  });

  it("should return 404 for a non-existent email", async () => {
    const res = await request(app).get("/api/users/email/ghost@example.com");

    expect(res.status).toBe(404);
  });
});

// Update user
describe("PUT /api/users/:id", () => {
  it("should update a user and return updated data", async () => {
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .send({ name: "Jane Updated", stylePreferences: ["streetwear"] });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Jane Updated");
    expect(res.body.stylePreferences).toContain("streetwear");
  });

  it("should return 404 for a non-existent user", async () => {
    const res = await request(app)
      .put("/api/users/000000000000000000000001")
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// Delete user
describe("DELETE /api/users/:id", () => {
  it("should delete a user and return success message", async () => {
    const res = await request(app).delete(`/api/users/${createdUserId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  it("should return 404 for already deleted user", async () => {
    const res = await request(app).delete(`/api/users/${createdUserId}`);

    expect(res.status).toBe(404);
  });
});
