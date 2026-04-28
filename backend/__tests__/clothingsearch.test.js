const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const testUserId = "9999999999"

describe("GET /api/clothingItems (filters)", () => {
  beforeAll(async () => {
    await request(app).post("/api/clothingItems").send({
      userId: testUserId,
      name: "Black Shirt",
      category: "upper_body",
      size: "M",
      colour: "black",
      fit: "regular",
      imageUrls: { front: "", back: "", side: "" },
    });

    await request(app).post("/api/clothingItems").send({
      userId: testUserId,
      name: "Blue Jeans",
      category: "lower_body",
      size: "L",
      colour: "blue",
      fit: "slim",
      imageUrls: { front: "", back: "", side: "" },
    });
  });

  it("should filter by category", async () => {
    const res = await request(app)
      .get("/api/clothingItems")
      .query({ category: "upper_body" });

    expect(res.status).toBe(200);
    expect(res.body.every(i => i.category === "upper_body")).toBe(true);
  });

  it("should filter by colour", async () => {
    const res = await request(app)
      .get("/api/clothingItems")
      .query({ colour: "blue" });

    expect(res.status).toBe(200);
    expect(res.body.every(i => i.colour === "blue")).toBe(true);
  });

  it("should filter by multiple fields", async () => {
    const res = await request(app)
      .get("/api/clothingItems")
      .query({ category: "lower_body", size: "L" });

    expect(res.status).toBe(200);
    expect(res.body.every(i =>
      i.category === "lower_body" && i.size === "L"
    )).toBe(true);
  });
    afterAll(async () => {
    await mongoose.connection.close();
    });
});