require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const ClothingItem = require("../models/ClothingItems");
const Outfit = require("../models/Outfit");
const outfitService = require("../db/outfitService");

const createTestUser = () =>
  User.create({
    auth0UserId: "auth0|test-user",
    name: "Jane Doe",
    email: `jane${Date.now()}@example.com`,
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

describe("Outfit service", () => {
  it("creates an outfit for a user", async () => {
    const user = await createTestUser();
    const item1 = await createTestItem(user._id, { category: "upper_body" });
    const item2 = await createTestItem(user._id, { category: "lower_body" });

    const outfit = await outfitService.addOutfit({
      userId: user._id,
      name: "Summer Outfit",
      items: [item1._id, item2._id],
    });

    expect(outfit).toBeDefined();
    expect(outfit.name).toBe("Summer Outfit");
    expect(String(outfit.userId)).toBe(String(user._id));
    expect(outfit.items).toHaveLength(2);
  });

  it("updates an existing outfit name", async () => {
    const user = await createTestUser();
    const item1 = await createTestItem(user._id, { category: "upper_body" });
    const item2 = await createTestItem(user._id, { category: "lower_body" });
    const outfit = await outfitService.addOutfit({
      userId: user._id,
      name: "Original Outfit",
      items: [item1._id, item2._id],
    });

    const updated = await outfitService.updateOutfitForUser(outfit._id, user._id, {
      name: "Updated Outfit",
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe("Updated Outfit");
    expect(String(updated.userId)).toBe(String(user._id));
  });

  it("deletes an outfit for the owner", async () => {
    const user = await createTestUser();
    const item1 = await createTestItem(user._id, { category: "upper_body" });
    const item2 = await createTestItem(user._id, { category: "lower_body" });
    const outfit = await outfitService.addOutfit({
      userId: user._id,
      name: "Delete Outfit",
      items: [item1._id, item2._id],
    });

    const deleted = await outfitService.deleteOutfitForUser(outfit._id, user._id);
    expect(deleted).toBeDefined();
    expect(String(deleted._id)).toBe(String(outfit._id));

    const fetched = await Outfit.findById(outfit._id);
    expect(fetched).toBeNull();
  });

  it("stores style and favourite on creation", async () => {
    const user = await createTestUser();
    const item = await createTestItem(user._id, { category: "upper_body" });

    const outfit = await outfitService.addOutfit({
      userId: user._id,
      name: "Styled Outfit",
      items: [item._id],
      style: "Street",
      favourite: true,
    });

    expect(outfit.style).toBe("Street");
    expect(outfit.favourite).toBe(true);
  });

  it("updates favourite without affecting other fields", async () => {
    const user = await createTestUser();
    const outfit = await outfitService.addOutfit({
      userId: user._id,
      name: "Fav Test",
      items: [],
      style: "Minimal",
      favourite: false,
    });

    const updated = await outfitService.updateOutfitForUser(outfit._id, user._id, {
      favourite: true,
    });

    expect(updated.favourite).toBe(true);
    expect(updated.style).toBe("Minimal");
    expect(updated.name).toBe("Fav Test");
  });
});
