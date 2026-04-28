const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

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

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  process.env.REPLICATE_API_TOKEN = "test-token";
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/tryon", () => {
  it("should return 400 when humanImageBase64 is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      garmentImageBase64: "https://example.com/garment.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("humanImageBase64 is required");
  });

  it("should return 400 when garmentImageBase64 is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageBase64: "https://example.com/human.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("garmentImageBase64 is required");
  });

  it("should return 400 when category is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageBase64: "https://example.com/human.jpg",
      garmentImageBase64: "https://example.com/garment.jpg",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("category is required");
  });

  it("should return 400 for an invalid category", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageBase64: "https://example.com/human.jpg",
      garmentImageBase64: "https://example.com/garment.jpg",
      category: "top",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "category must be one of: upper_body, lower_body, dresses",
    );
  });

  it("should return 200 with imageUrl on success", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageBase64: "https://example.com/human.jpg",
      garmentImageBase64: "https://example.com/garment.jpg",
      category: "upper_body",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.imageUrl).toBe("https://replicate.delivery/mock/output.jpg");
  });
});