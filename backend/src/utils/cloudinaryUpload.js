const cloudinary = require("../config/cloudinary");
const appConfig = require("../config");

function toDataUri(buffer, mimeType = "image/jpeg") {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function uploadImage(buffer, options = {}) {
  if (!buffer) {
    throw new Error("Image buffer is required.");
  }

  const dataUri = toDataUri(buffer, options.mimeType || "image/jpeg");

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder || appConfig.cloudinary.folder,
    resource_type: options.resource_type || "image",
    public_id: options.public_id,
    overwrite: options.overwrite || false,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

async function uploadVideo(buffer, options = {}) {
  const dataUri = toDataUri(buffer, options.mimeType || "video/mp4");

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder || appConfig.cloudinary.folder,
    resource_type: "video",
    public_id: options.public_id,
    overwrite: options.overwrite || false,
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

module.exports = {
  uploadImage,
  uploadVideo,
};
