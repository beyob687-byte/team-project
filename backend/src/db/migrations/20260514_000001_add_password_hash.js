exports.up = async function up(knex) {
  const hasPasswordHash = await knex.schema.hasColumn("users", "password_hash");

  if (!hasPasswordHash) {
    await knex.schema.alterTable("users", (table) => {
      table.text("password_hash").nullable();
    });
  }

  await knex.raw(
    'ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL',
  );
  await knex.raw(
    'ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_university_email_unique"',
  );
  await knex.raw('DROP INDEX IF EXISTS "users_university_email_unique"');
  await knex.raw('DROP INDEX IF EXISTS "users_email_university_unique"');
  await knex.raw(
    'CREATE UNIQUE INDEX IF NOT EXISTS "users_email_university_unique" ON "users" ("university_id", "email")',
  );
  await knex.raw(
    'ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_university_sso_id_unique"',
  );
};

exports.down = async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS "users_email_university_unique"');
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("password_hash");
  });
};
