const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const testUserId = "000000000000000000000000";
let createdItemId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

// !! Deletes collection when finished testing, use a new collection by changing env var is preferred
afterAll(async () => {
  //   await mongoose.connection.dropCollection("clothingitems");
  await mongoose.disconnect();
});

// Test adding items in 3 ways
describe("POST /api/clothingItems", () => {
  it("should create a new item and return 201", async () => {
    const res = await request(app)
      .post("/api/clothingItems")
      .send({
        userId: testUserId,
        name: "Tshirt",
        category: "top",
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
    expect(res.body.colour).toBe("black");
    createdItemId = res.body._id;
  });

  it("should create item with partial fields", async () => {
    const res = await request(app)
      .post("/api/clothingItems")
      .send({ userId: testUserId, name: "Jacket" });

    expect(res.status).toBe(400);
  });

  it("should create item with empty body", async () => {
    const res = await request(app).post("/api/clothingItems").send({});

    expect(res.status).toBe(400);
  });
});

// Return all items from user
describe("GET /api/clothingItems/:userId", () => {
  it("should return items for a valid userId", async () => {
    const res = await request(app).get(`/api/clothingItems/${testUserId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return empty array for unknown userId", async () => {
    const res = await request(app).get(
      "/api/clothingItems/999999999999999999999999",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// Update an item
describe("PUT /api/clothingItems/:id", () => {
  it("should update an item and return updated data", async () => {
    const res = await request(app)
      .put(`/api/clothingItems/${createdItemId}`)
      .send({ name: "Hoodie", colour: "blue" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Hoodie");
    expect(res.body.colour).toBe("blue");
  });

  it("should return 404 for a non-existent item", async () => {
    const res = await request(app)
      .put("/api/clothingItems/000000000000000000000001")
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });
});

// Deletes an item
describe("DELETE /api/clothingItems/:id", () => {
  it("should delete an item and return success message", async () => {
    const res = await request(app).delete(
      `/api/clothingItems/${createdItemId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item deleted successfully");
  });

  it("should return 404 for already deleted item", async () => {
    const res = await request(app).delete(
      `/api/clothingItems/${createdItemId}`,
    );

    expect(res.status).toBe(404);
  });
});
