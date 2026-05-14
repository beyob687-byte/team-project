const { v2: cloudinary } = require("cloudinary");
const appConfig = require("./index");

cloudinary.config({
  cloud_name: appConfig.cloudinary.cloudName,
  api_key: appConfig.cloudinary.apiKey,
  api_secret: appConfig.cloudinary.apiSecret,
  secure: true,
});

module.exports = cloudinary;
