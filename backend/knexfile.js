require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: makeConnection(),
    migrations: {
      directory: "./src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "js",
    },
    pool: { min: 2, max: 10 },
  },

  testing: {
    client: "pg",
    connection: makeConnection(),
    migrations: {
      directory: "./src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "js",
    },
    pool: { min: 1, max: 5 },
  },

  production: {
    client: "pg",
    connection: makeConnection(),
    migrations: {
      directory: "./src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "js",
    },
    pool: { min: 5, max: 20 },
  },
};

function makeConnection() {
  const url =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/uniclubs";
  // When connecting to Supabase (or any hosted Postgres with TLS) set DATABASE_SSL=true
  if (process.env.DATABASE_SSL === "true") {
    return {
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    };
  }
  return url;
}
