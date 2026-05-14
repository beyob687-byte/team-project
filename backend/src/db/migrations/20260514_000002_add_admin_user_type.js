exports.up = async function up(knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'user_type_enum'
      ) THEN
        BEGIN
          ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'admin';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;
      END IF;
    END $$;
  `);

  await knex.raw(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_user_type_check;
  `);

  await knex.raw(`
    ALTER TABLE users
    ADD CONSTRAINT users_user_type_check
    CHECK (user_type IN ('student', 'faculty', 'staff', 'admin'));
  `);
};

exports.down = async function down() {
  // PostgreSQL does not support removing enum values safely.
};
