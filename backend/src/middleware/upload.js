const multer = require("multer");

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
});

const postImagesUpload = upload.array("images", 5);
const eventCoverUpload = upload.single("cover_image");

module.exports = {
  upload,
  postImagesUpload,
  eventCoverUpload,
  MAX_UPLOAD_SIZE_BYTES,
};
