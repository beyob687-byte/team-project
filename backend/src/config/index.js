const path = require("path");
const dotenv = require("dotenv");

// Load backend/.env even when node is started from backend/src.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function toNumber(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

const nodeEnv = process.env.NODE_ENV || "development";

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv === "development",
  isTest: nodeEnv === "test",
  port: toNumber(process.env.PORT, 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://uniclubs_admin:password@localhost:5432/uniclubs_dev",
  databaseSsl: toBoolean(process.env.DATABASE_SSL, false),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 12),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "a-very-long-random-string",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "another-long-random-string",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  cookie: {
    secure: nodeEnv === "production",
    sameSite: "lax",
  },
};
