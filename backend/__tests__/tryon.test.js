const request = require("supertest");
const mongoose = require("mongoose");

jest.mock("../middleware/auth.js", () => ({
  requireAuth: (req, res, next) => {
    req.auth = {
      payload: {
        sub: "auth0|test-user",
      },
    };

    next();
  },
}));

jest.mock("../db/userService", () => ({
  getUserByAuth0UserId: jest.fn().mockResolvedValue({ _id: "test-user-id" }),
}));

// Mock the replicate module so tests never call the real API
jest.mock("replicate", () => {
  return jest.fn().mockImplementation(() => ({
    predictions: {
      create: jest.fn().mockResolvedValue({ id: "mock-prediction-id" }),
    },
    wait: jest.fn().mockResolvedValue({
      output: "https://replicate.delivery/mock/output.jpg",
      status: "succeeded",
      error: null,
    }),
  }));
});

const app = require("../app");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  process.env.REPLICATE_API_TOKEN = "test-token";
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/tryon", () => {
  it("should return 400 when humanImageUrl is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      garmentImageUrl: "https://example.com/garment.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("humanImageUrl is required");
  });

  it("should return 400 when garmentImageUrl is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/human.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("garmentImageUrl is required");
  });

  it("should return 400 when category is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/human.jpg",
      garmentImageUrl: "https://example.com/garment.jpg",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("category is required");
  });

  it("should return 400 for an invalid category", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/human.jpg",
      garmentImageUrl: "https://example.com/garment.jpg",
      category: "top",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "category must be one of: upper_body, lower_body, dresses",
    );
  });

  it("should return 200 with imageUrl on success", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/human.jpg",
      garmentImageUrl: "https://example.com/garment.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.imageUrl).toBe("https://replicate.delivery/mock/output.jpg");
  });
});
