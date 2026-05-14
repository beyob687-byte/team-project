const knex = require("knex");
const appConfig = require("../config");
const knexConfig =
  require("../../knexfile")[appConfig.nodeEnv] ||
  require("../../knexfile").development;

const db = knex(knexConfig);

module.exports = db;
