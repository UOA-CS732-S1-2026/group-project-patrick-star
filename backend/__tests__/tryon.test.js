const express = require("express");
const request = require("supertest");

process.env.REPLICATE_API_TOKEN = "test-token";

const mockRun = jest.fn();
const mockPopulate = jest.fn();

jest.mock("replicate", () => {
  return jest.fn().mockImplementation(() => ({
    run: mockRun,
  }));
});

jest.mock("../middleware/auth", () => ({
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
  getUserByAuth0UserId: jest.fn(),
}));

jest.mock("../models/Outfit", () => ({
  findById: jest.fn(),
}));

const Outfit = require("../models/Outfit");
const { getUserByAuth0UserId } = require("../db/userService");
const tryonRouter = require("../routes/tryon");

const app = express();
app.use(express.json());
app.use("/api/tryon", tryonRouter);

const user = { _id: "user-1" };

function mockOutfitLookup(outfit) {
  mockPopulate.mockResolvedValue(outfit);
  Outfit.findById.mockReturnValue({ populate: mockPopulate });
}

describe("POST /api/tryon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REPLICATE_API_TOKEN = "test-token";
    getUserByAuth0UserId.mockResolvedValue(user);
  });

  it("returns 400 if humanImageUrl is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      outfitId: "outfit-1",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("humanImageUrl is required");
    expect(Outfit.findById).not.toHaveBeenCalled();
  });

  it("returns 400 if outfitId is missing", async () => {
    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("outfitId is required");
    expect(Outfit.findById).not.toHaveBeenCalled();
  });

  it("returns 404 if the outfit does not exist", async () => {
    mockOutfitLookup(null);

    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
      outfitId: "missing-outfit",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Outfit not found");
    expect(Outfit.findById).toHaveBeenCalledWith("missing-outfit");
    expect(mockPopulate).toHaveBeenCalledWith("items");
  });

  it("returns 403 if the outfit belongs to a different user", async () => {
    mockOutfitLookup({
      userId: { toString: () => "other-user" },
      items: [],
    });

    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
      outfitId: "outfit-1",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("returns 400 if the outfit has no items with a front image", async () => {
    mockOutfitLookup({
      userId: { toString: () => "user-1" },
      items: [
        {
          name: "Jacket",
          category: "outerwear",
          imageUrls: { back: "https://example.com/jacket-back.jpg" },
        },
        {
          name: "Shoes",
          category: "shoes",
          imageUrls: {},
        },
        {
          name: "Hat",
          category: "accessories",
        },
      ],
    });

    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
      outfitId: "outfit-1",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No garment images found in this outfit");
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("calls Replicate with the full outfit and returns the generated image URL", async () => {
    mockRun.mockResolvedValue("https://example.com/result.jpg");
    mockOutfitLookup({
      userId: { toString: () => "user-1" },
      items: [
        {
          name: "Tshirt",
          category: "upper_body",
          imageUrls: { front: "https://example.com/tshirt-front.jpg" },
        },
        {
          name: "Jeans",
          category: "lower_body",
          imageUrls: { front: "https://example.com/jeans-front.jpg" },
        },
      ],
    });

    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
      outfitId: "outfit-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      imageUrl: "https://example.com/result.jpg",
    });
    expect(mockRun).toHaveBeenCalledWith("openai/gpt-image-2", {
      input: {
        prompt: expect.stringContaining(
          "Virtual try-on: dress the person in Image 1",
        ),
        input_images: [
          "https://example.com/person.jpg",
          "https://example.com/tshirt-front.jpg",
          "https://example.com/jeans-front.jpg",
        ],
        quality: "low",
        aspect_ratio: "1:1",
        number_of_images: 1,
      },
    });
    expect(mockRun.mock.calls[0][1].input.prompt).toContain(
      "Tshirt (upper_body), Jeans (lower_body)",
    );
  });

  it("returns 500 if Replicate throws an error", async () => {
    mockRun.mockRejectedValue(new Error("Replicate network failure"));
    mockOutfitLookup({
      userId: { toString: () => "user-1" },
      items: [
        {
          name: "Tshirt",
          category: "upper_body",
          imageUrls: { front: "https://example.com/tshirt-front.jpg" },
        },
        {
          name: "Jeans",
          category: "lower_body",
          imageUrls: { front: "https://example.com/jeans-front.jpg" },
        },
      ],
    });

    const res = await request(app).post("/api/tryon").send({
      humanImageUrl: "https://example.com/person.jpg",
      outfitId: "outfit-1",
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
