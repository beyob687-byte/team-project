const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const appConfig = require("./config");
const authMiddleware = require("./middleware/auth");
const adminMiddleware = require("./middleware/admin");
const authRoutes = require("./modules/auth/auth.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const clubsRoutes = require("./modules/clubs/clubs.routes");
const usersRoutes = require("./modules/users/users.routes");
const { createAuthRateLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: appConfig.clientUrl,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      environment: appConfig.nodeEnv,
    },
  });
});

async function startServer() {
  const authRateLimiter = createAuthRateLimiter();

  app.use("/api/v1/auth", authRateLimiter, authRoutes);
  app.use("/api/v1/admin", authMiddleware, adminMiddleware, adminRoutes);
  app.use("/api/v1/clubs", authMiddleware, clubsRoutes);
  app.use("/api/v1/users", usersRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found.",
      },
    });
  });

  app.use(errorHandler);

  const server = app.listen(appConfig.port, () => {
    console.log(`UniClubs backend running on port ${appConfig.port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = appConfig.port + 1;
      console.warn(
        `Port ${appConfig.port} is in use. Trying port ${nextPort}...`,
      );
      app.listen(nextPort, () => {
        console.log(`UniClubs backend running on port ${nextPort}`);
      });
    } else {
      console.error("Server error:", error);
      process.exit(1);
    }
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

module.exports = app;
