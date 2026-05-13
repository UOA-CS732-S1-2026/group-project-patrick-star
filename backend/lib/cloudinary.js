const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Convert an uploaded buffer into a readable stream for Cloudinary's upload_stream API.
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// Persist externally generated images so try-on previews remain available after Replicate URLs expire.
function uploadImageUrlToCloudinary(imageUrl, folder) {
  return cloudinary.uploader
    .upload(imageUrl, { folder, resource_type: "image" })
    .then((result) => result.secure_url);
}

module.exports = { uploadToCloudinary, uploadImageUrlToCloudinary };
