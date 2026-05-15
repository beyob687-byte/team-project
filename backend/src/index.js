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
const {
  publicRouter: clubsPublicRouter,
  router: clubsAuthRouter,
} = require("./modules/clubs/clubs.routes");
const usersRoutes = require("./modules/users/users.routes");
const achievementsRoutes = require("./modules/achievements/achievements.routes");
const { respondentSurveysRouter } = require("./modules/surveys/surveys.routes");
const { createAuthRateLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const http = require("http");
const { setupSocket } = require("./websocket/socket");

const app = express();

app.use(helmet());
const allowedOrigins = [
  "https://un-iclubs.vercel.app",

  appConfig.clientUrl,
  "https://uniclubs-f0ab.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .concat(
    process.env.BACKEND_ALLOWED_ORIGINS
      ? process.env.BACKEND_ALLOWED_ORIGINS.split(",").map((s) => s.trim())
      : [],
  )
  .map((url) => url.trim().replace(/\/$/, "")) // Remove trailing whitespace and slashes
  .filter((v, i, a) => v && a.indexOf(v) === i); // Remove duplicates

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser requests like curl/postman (no origin)
      if (!origin) return callback(null, true);
      // Normalize incoming origin by removing trailing slash and whitespace
      const normalizedOrigin = origin.trim().replace(/\/$/, "");
      if (allowedOrigins.indexOf(normalizedOrigin) !== -1)
        return callback(null, normalizedOrigin);
      console.warn(`CORS blocked: ${origin} not in allowed origins`);
      return callback(
        new Error(
          "The CORS policy for this site does not allow access from the specified Origin.",
        ),
        false,
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    optionsSuccessStatus: 200,
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
  app.use("/api/v1/clubs", clubsPublicRouter);
  app.use("/api/v1/clubs", authMiddleware, clubsAuthRouter);
  app.use("/api/v1/users", usersRoutes);
  app.use("/api/v1", achievementsRoutes);
  app.use("/api/v1/surveys", respondentSurveysRouter);

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

  const server = http.createServer(app);
  const io = setupSocket(server);

  // expose io to notification service so it can emit
  try {
    const {
      setSocket,
    } = require("./modules/notifications/notificationService");
    setSocket(io);
  } catch (err) {
    // ignore if service not present
  }

  server.listen(appConfig.port, () => {
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
