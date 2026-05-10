const express = require("express");
const {
  addUser,
  getUserByAuth0UserId,
  updateUser,
  deleteUser,
} = require("../db/userService");
const { uploadToCloudinary } = require("../lib/cloudinary");
const upload = require("../middleware/upload");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

const PROFILE_FIELDS = [
  "name",
  "bodyProfile",
  "stylePreferences",
  "profilePhoto",
  "modelImage",
];

function getValidationMessages(error) {
  if (!error.errors) {
    return [error.message];
  }

  return Object.values(error.errors).map((fieldError) => fieldError.message);
}

function toOptionalNumber(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    const error = new Error(`${fieldName} must be a non-negative number`);
    error.status = 400;
    throw error;
  }

  return number;
}

function buildBodyProfileUpdate(bodyProfile = {}) {
  const update = {};

  const age = toOptionalNumber(bodyProfile.age, "age");
  const height = toOptionalNumber(bodyProfile.height, "height");
  const weight = toOptionalNumber(bodyProfile.weight, "weight");

  if (age !== undefined) update.age = age;
  if (height !== undefined) update.height = height;
  if (weight !== undefined) update.weight = weight;

  if (bodyProfile.bodyType !== undefined) {
    update.bodyType = bodyProfile.bodyType;
  } else if (bodyProfile.bodyShape !== undefined) {
    update.bodyType = bodyProfile.bodyShape;
  }

  if (bodyProfile.gender !== undefined) {
    update.gender = bodyProfile.gender;
  }

  return update;
}

function buildProfileUpdate(body) {
  const update = {};

  if (body.name !== undefined) update.name = body.name;
  if (body.profilePhoto !== undefined) update.profilePhoto = body.profilePhoto;
  if (body.modelImage !== undefined) update.modelImage = body.modelImage;

  if (body.bodyProfile !== undefined) {
    update.bodyProfile = buildBodyProfileUpdate(body.bodyProfile);
  }

  if (body.stylePreferences !== undefined) {
    if (!Array.isArray(body.stylePreferences)) {
      const error = new Error("stylePreferences must be an array");
      error.status = 400;
      throw error;
    }

    update.stylePreferences = body.stylePreferences;
  }

  return update;
}

async function getAuthenticatedUser(req, res) {
  const auth0UserId = req.auth.payload.sub;
  const user = await getUserByAuth0UserId(auth0UserId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  return user;
}

router.post("/me/sync", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const existingUser = await getUserByAuth0UserId(auth0UserId);

    if (existingUser) {
      return res.json(existingUser);
    }

    const newUser = await addUser({
      auth0UserId,
      name: req.body.name,
      email: req.body.email,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const auth0UserId = req.auth.payload.sub;
    const user = await getUserByAuth0UserId(auth0UserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    const updatedUser = await updateUser(existingUser._id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ errors: getValidationMessages(error) });
  }
});

router.patch("/me/profile", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    const unsupportedFields = Object.keys(req.body).filter(
      (field) => !PROFILE_FIELDS.includes(field),
    );

    if (unsupportedFields.length > 0) {
      return res.status(400).json({
        error: `Unsupported profile fields: ${unsupportedFields.join(", ")}`,
      });
    }

    const update = buildProfileUpdate(req.body);
    const updatedUser = await updateUser(existingUser._id, update);

    res.json(updatedUser);
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ errors: getValidationMessages(error) });
  }
});

router.patch("/me/body-profile", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    const bodyProfile = {
      ...existingUser.bodyProfile?.toObject?.(),
      ...buildBodyProfileUpdate(req.body),
    };
    const updatedUser = await updateUser(existingUser._id, { bodyProfile });

    res.json(updatedUser);
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ errors: getValidationMessages(error) });
  }
});

router.patch("/me/style-preferences", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    const { stylePreferences } = req.body;

    if (!Array.isArray(stylePreferences)) {
      return res.status(400).json({ error: "stylePreferences must be an array" });
    }

    const updatedUser = await updateUser(existingUser._id, { stylePreferences });

    res.json(updatedUser);
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ errors: getValidationMessages(error) });
  }
});

router.put("/me/photo", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    const { profilePhoto } = req.body;
    if (!profilePhoto) {
      return res.status(400).json({ error: "profilePhoto is required" });
    }
    const user = await updateUser(existingUser._id, { profilePhoto });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "Profile photo updated successfully",
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/me/photo/upload",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const existingUser = await getAuthenticatedUser(req, res);
      if (!existingUser) {
        return;
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const url = await uploadToCloudinary(req.file.buffer, "profiles");
      const user = await updateUser(existingUser._id, { modelImage: url });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Model image uploaded successfully",
        modelImage: user.modelImage,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.delete("/me", requireAuth, async (req, res) => {
  try {
    const existingUser = await getAuthenticatedUser(req, res);
    if (!existingUser) {
      return;
    }

    await deleteUser(existingUser._id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
