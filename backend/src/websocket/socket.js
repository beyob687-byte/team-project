const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const appConfig = require("../config");

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: appConfig.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const parsed = cookie.parse(raw || "");
      const token = parsed.accessToken;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, appConfig.jwt.accessSecret);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {});
  });

  return io;
}

module.exports = { setupSocket };
