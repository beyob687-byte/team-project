exports.up = async function up(knex) {
  await knex.schema.alterTable("poll_votes", (table) => {
    table.dropUnique(["poll_id", "user_id"], "poll_votes_poll_user_unique");
    table.unique(
      ["poll_id", "user_id", "option_id"],
      "poll_votes_poll_user_option_unique",
    );
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable("poll_votes", (table) => {
    table.dropUnique(
      ["poll_id", "user_id", "option_id"],
      "poll_votes_poll_user_option_unique",
    );
    table.unique(["poll_id", "user_id"], "poll_votes_poll_user_unique");
  });
};
