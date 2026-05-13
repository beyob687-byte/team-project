/**
 * Initial UniClubs schema migration.
 *
 * This migration creates the full multi-tenant database schema using Knex.
 * It intentionally avoids database-level RLS because tenancy is enforced in the
 * application layer.
 */

exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  const enumDefinitions = [
    'CREATE TYPE user_type_enum AS ENUM (\'student\', \'faculty\', \'staff\')',
    'CREATE TYPE club_membership_policy_enum AS ENUM (\'open\', \'approval\', \'invite_only\')',
    'CREATE TYPE club_status_enum AS ENUM (\'pending\', \'active\', \'suspended\', \'inactive\')',
    'CREATE TYPE club_media_type_enum AS ENUM (\'image\', \'video\')',
    'CREATE TYPE club_registration_status_enum AS ENUM (\'pending\', \'approved\', \'rejected\', \'conditional\')',
    'CREATE TYPE club_membership_status_enum AS ENUM (\'active\', \'pending\', \'suspended\', \'alumni\')',
    'CREATE TYPE membership_request_status_enum AS ENUM (\'pending\', \'approved\', \'denied\')',
    'CREATE TYPE project_status_enum AS ENUM (\'planning\', \'in_progress\', \'completed\')',
    'CREATE TYPE project_visibility_enum AS ENUM (\'public\', \'members_only\')',
    'CREATE TYPE project_media_type_enum AS ENUM (\'image\', \'video\', \'document\')',
    'CREATE TYPE event_type_enum AS ENUM (\'in_person\', \'virtual\', \'hybrid\')',
    'CREATE TYPE event_visibility_enum AS ENUM (\'public\', \'club_members\', \'invite_only\')',
    'CREATE TYPE event_status_enum AS ENUM (\'draft\', \'published\', \'cancelled\', \'completed\')',
    'CREATE TYPE event_rsvp_status_enum AS ENUM (\'registered\', \'waitlisted\', \'cancelled\', \'attended\', \'no_show\')',
    'CREATE TYPE attendance_checkin_method_enum AS ENUM (\'manual\', \'qr_scan\', \'geo\', \'self_code\')',
    'CREATE TYPE post_type_enum AS ENUM (\'general\', \'event_promotion\', \'project_highlight\', \'poll\')',
    'CREATE TYPE post_visibility_enum AS ENUM (\'public\', \'members_only\')',
    'CREATE TYPE post_moderation_status_enum AS ENUM (\'pending\', \'approved\', \'rejected\', \'quarantined\')',
    'CREATE TYPE post_status_enum AS ENUM (\'draft\', \'published\', \'archived\')',
    'CREATE TYPE comment_moderation_status_enum AS ENUM (\'pending\', \'approved\', \'rejected\')',
    'CREATE TYPE poll_results_visibility_enum AS ENUM (\'always\', \'after_vote\', \'after_close\')',
    'CREATE TYPE moderation_flag_type_enum AS ENUM (\'ai_auto\', \'user_report\')',
    'CREATE TYPE moderation_flag_status_enum AS ENUM (\'pending\', \'resolved_approved\', \'resolved_rejected\', \'escalated\')',
    'CREATE TYPE moderation_appeal_status_enum AS ENUM (\'pending\', \'approved\', \'denied\')',
    'CREATE TYPE user_restriction_type_enum AS ENUM (\'post_ban\', \'comment_ban\', \'full_ban\')',
    'CREATE TYPE achievement_category_enum AS ENUM (\'member\', \'club\')',
    'CREATE TYPE transaction_type_enum AS ENUM (\'income\', \'expense\')',
    'CREATE TYPE transaction_status_enum AS ENUM (\'pending\', \'approved\', \'rejected\')',
    'CREATE TYPE survey_target_audience_enum AS ENUM (\'members\', \'event_attendees\', \'all_students\')',
    'CREATE TYPE survey_status_enum AS ENUM (\'draft\', \'published\', \'closed\')',
    'CREATE TYPE survey_question_type_enum AS ENUM (\'text\', \'single_choice\', \'multi_choice\', \'rating\')',
    'CREATE TYPE report_status_enum AS ENUM (\'draft\', \'published\')',
  ];

  for (const statement of enumDefinitions) {
    await knex.raw(`DO $$ BEGIN ${statement}; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
  }

  await knex.schema.createTable('universities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 200).notNullable();
    table.string('short_name', 50).notNullable().unique();
    table.string('domain', 255).notNullable().unique();
    table.string('logo_url', 500).nullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.jsonb('settings').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    table.string('password_hash', 255).notNullable();
    table.string('email', 320).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('student_id', 50).nullable();
    table.string('external_auth_id', 255).nullable();
    table.enu('user_type', ['student', 'faculty', 'staff'], {
      useNative: false,
      enumName: 'user_type_enum',
    }).notNullable().defaultTo('student');
    table.string('major', 100).nullable();
    table.string('department', 100).nullable();
    table.string('enrollment_status', 20).nullable();
    table.string('profile_image_url', 500).nullable();
    table.text('bio').nullable();
    table.specificType('interests', 'text[]').nullable();
    table.boolean('privacy_profile_visible').defaultTo(true);
    table.boolean('privacy_roster_visible').defaultTo(true);
    table.boolean('allow_ai_recommend').defaultTo(true);
    table.jsonb('notification_preferences').notNullable().defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('last_login', { useTz: true }).nullable();

    table.unique(['university_id', 'email'], 'users_university_email_unique');
    table.unique(['university_id', 'student_id'], 'users_university_student_id_unique');
    table.unique(['university_id', 'external_auth_id'], 'users_university_external_auth_unique');
    table.index(['university_id'], 'users_university_id_idx');
    table.index(['external_auth_id'], 'users_external_auth_id_idx');
    table.index(['student_id'], 'users_student_id_idx');
  });

  await knex.schema.createTable('clubs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    table.string('name', 200).notNullable();
    table.string('short_name', 50).nullable();
    table.string('category', 50).notNullable();
    table.specificType('secondary_categories', 'text[]').nullable();
    table.text('mission_statement').nullable();
    table.string('logo_url', 500).nullable();
    table.string('cover_photo_url', 500).nullable();
    table.string('contact_email', 320).notNullable();
    table.jsonb('social_links').nullable();
    table.enu('membership_policy', ['open', 'approval', 'invite_only'], {
      useNative: false,
      enumName: 'club_membership_policy_enum',
    }).notNullable().defaultTo('approval');
    table.boolean('recruiting_status').defaultTo(true);
    table.enu('status', ['pending', 'active', 'suspended', 'inactive'], {
      useNative: false,
      enumName: 'club_status_enum',
    }).notNullable().defaultTo('pending');
    table.string('constitution_url', 500).nullable();
    table.string('faculty_advisor_name', 100).nullable();
    table.string('faculty_advisor_email', 320).nullable();
    table.jsonb('meeting_schedule').nullable();
    table.specificType('tags', 'text[]').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.unique(['university_id', 'name'], 'clubs_university_name_unique');
    table.unique(['university_id', 'short_name'], 'clubs_university_short_name_unique');
    table.index(['university_id'], 'clubs_university_id_idx');
    table.index(['status'], 'clubs_status_idx');
  });

  await knex.schema.createTable('club_media_gallery', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('media_url', 500).notNullable();
    table.enu('media_type', ['image', 'video'], {
      useNative: false,
      enumName: 'club_media_type_enum',
    }).notNullable();
    table.string('caption', 300).nullable();
    table.integer('sort_order').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('club_registration_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE').unique('club_registration_requests_club_unique');
    table.uuid('requested_by_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('submitted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.enu('status', ['pending', 'approved', 'rejected', 'conditional'], {
      useNative: false,
      enumName: 'club_registration_status_enum',
    }).notNullable().defaultTo('pending');
    table.uuid('admin_user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('admin_notes').nullable();
    table.timestamp('resolved_at', { useTz: true }).nullable();
  });

  await knex.schema.createTable('club_memberships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('role', 50).notNullable().defaultTo('member');
    table.enu('status', ['active', 'pending', 'suspended', 'alumni'], {
      useNative: false,
      enumName: 'club_membership_status_enum',
    }).notNullable().defaultTo('active');
    table.timestamp('join_date', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('left_date', { useTz: true }).nullable();
    table.uuid('invited_by').nullable().references('id').inTable('users').onDelete('SET NULL');

    table.unique(['user_id', 'club_id'], 'club_memberships_user_club_unique');
    table.index(['user_id'], 'memberships_user_idx');
    table.index(['club_id'], 'memberships_club_idx');
    table.index(['role'], 'memberships_role_idx');
  });

  await knex.schema.createTable('club_role_definitions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('role_name', 50).notNullable();
    table.boolean('is_custom').notNullable().defaultTo(false);
    table.jsonb('permissions').notNullable();
    table.unique(['club_id', 'role_name'], 'club_role_definitions_club_role_unique');
  });

  await knex.schema.createTable('membership_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.enu('status', ['pending', 'approved', 'denied'], {
      useNative: false,
      enumName: 'membership_request_status_enum',
    }).notNullable().defaultTo('pending');
    table.timestamp('requested_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('action_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('denial_reason').nullable();
  });

  await knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.date('start_date').nullable();
    table.date('end_date').nullable();
    table.enu('status', ['planning', 'in_progress', 'completed'], {
      useNative: false,
      enumName: 'project_status_enum',
    }).notNullable();
    table.enu('visibility', ['public', 'members_only'], {
      useNative: false,
      enumName: 'project_visibility_enum',
    }).notNullable().defaultTo('public');
    table.string('cover_image_url', 500).nullable();
    table.text('outcome').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['club_id'], 'projects_club_id_idx');
  });

  await knex.schema.createTable('project_media', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('url', 500).notNullable();
    table.enu('type', ['image', 'video', 'document'], {
      useNative: false,
      enumName: 'project_media_type_enum',
    }).nullable();
    table.string('caption', 300).nullable();
  });

  await knex.schema.createTable('project_collaborators', (table) => {
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('role', 50).nullable();
    table.primary(['project_id', 'user_id']);
  });

  await knex.schema.createTable('project_external_links', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('url', 500).notNullable();
    table.string('label', 100).notNullable();
  });

  await knex.schema.createTable('project_likes', (table) => {
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.primary(['project_id', 'user_id']);
  });

  await knex.schema.createTable('events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.enu('event_type', ['in_person', 'virtual', 'hybrid'], {
      useNative: false,
      enumName: 'event_type_enum',
    }).notNullable();
    table.string('location', 300).nullable();
    table.string('virtual_meeting_link', 500).nullable();
    table.timestamp('start_datetime', { useTz: true }).notNullable();
    table.timestamp('end_datetime', { useTz: true }).notNullable();
    table.string('timezone', 50).notNullable().defaultTo('UTC');
    table.string('cover_image_url', 500).nullable();
    table.enu('visibility', ['public', 'club_members', 'invite_only'], {
      useNative: false,
      enumName: 'event_visibility_enum',
    }).notNullable();
    table.boolean('rsvp_required').notNullable().defaultTo(false);
    table.timestamp('rsvp_opens_at', { useTz: true }).nullable();
    table.timestamp('rsvp_closes_at', { useTz: true }).nullable();
    table.integer('capacity').nullable();
    table.boolean('waitlist_enabled').notNullable().defaultTo(false);
    table.jsonb('custom_rsvp_questions').nullable();
    table.jsonb('checkin_method').nullable();
    table.string('checkin_code', 20).nullable();
    table.enu('status', ['draft', 'published', 'cancelled', 'completed'], {
      useNative: false,
      enumName: 'event_status_enum',
    }).notNullable().defaultTo('draft');
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['club_id', 'status', 'start_datetime'], 'events_club_status_start_idx');
  });

  await knex.schema.createTable('event_rsvps', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enu('status', ['registered', 'waitlisted', 'cancelled', 'attended', 'no_show'], {
      useNative: false,
      enumName: 'event_rsvp_status_enum',
    }).notNullable().defaultTo('registered');
    table.timestamp('rsvp_submitted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.jsonb('response_data').nullable();
    table.integer('number_of_guests').notNullable().defaultTo(0);
    table.string('ticket_code', 50).unique();

    table.unique(['event_id', 'user_id'], 'event_rsvps_event_user_unique');
    table.index(['event_id'], 'event_rsvps_event_idx');
  });

  await knex.schema.createTable('attendance_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('rsvp_id').nullable().references('id').inTable('event_rsvps').onDelete('SET NULL');
    table.enu('checkin_method', ['manual', 'qr_scan', 'geo', 'self_code'], {
      useNative: false,
      enumName: 'attendance_checkin_method_enum',
    }).notNullable();
    table.timestamp('checkin_time', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('marked_by').nullable().references('id').inTable('users').onDelete('SET NULL');

    table.unique(['event_id', 'user_id'], 'attendance_records_event_user_unique');
    table.index(['event_id'], 'attendance_event_idx');
  });

  await knex.schema.createTable('posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.uuid('author_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.enu('post_type', ['general', 'event_promotion', 'project_highlight', 'poll'], {
      useNative: false,
      enumName: 'post_type_enum',
    }).notNullable().defaultTo('general');
    table.text('content').notNullable();
    table.specificType('images', 'text[]').nullable();
    table.string('video_url', 500).nullable();
    table.uuid('linked_event_id').nullable().references('id').inTable('events').onDelete('SET NULL');
    table.uuid('linked_project_id').nullable().references('id').inTable('projects').onDelete('SET NULL');
    table.timestamp('scheduled_at', { useTz: true }).nullable();
    table.enu('visibility', ['public', 'members_only'], {
      useNative: false,
      enumName: 'post_visibility_enum',
    }).notNullable().defaultTo('public');
    table.enu('moderation_status', ['pending', 'approved', 'rejected', 'quarantined'], {
      useNative: false,
      enumName: 'post_moderation_status_enum',
    }).notNullable().defaultTo('pending');
    table.enu('status', ['draft', 'published', 'archived'], {
      useNative: false,
      enumName: 'post_status_enum',
    }).notNullable().defaultTo('published');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('published_at', { useTz: true }).nullable();

    table.index(['club_id', 'status', 'published_at'], 'posts_club_status_published_idx');
  });

  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('commentable_type', 20).notNullable();
    table.uuid('commentable_id').notNullable();
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.uuid('parent_comment_id').nullable().references('id').inTable('comments').onDelete('CASCADE');
    table.text('content').notNullable();
    table.enu('moderation_status', ['pending', 'approved', 'rejected'], {
      useNative: false,
      enumName: 'comment_moderation_status_enum',
    }).notNullable().defaultTo('pending');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['commentable_type', 'commentable_id'], 'comments_commentable_idx');
  });

  await knex.schema.createTable('polls', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE').unique('polls_post_unique');
    table.string('question', 500).notNullable();
    table.timestamp('expires_at', { useTz: true }).nullable();
    table.enu('results_visibility', ['always', 'after_vote', 'after_close'], {
      useNative: false,
      enumName: 'poll_results_visibility_enum',
    }).notNullable().defaultTo('after_close');
    table.boolean('multiple_choice').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('poll_options', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('poll_id').notNullable().references('id').inTable('polls').onDelete('CASCADE');
    table.string('option_text', 200).notNullable();
    table.integer('sort_order').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('poll_votes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('poll_id').notNullable().references('id').inTable('polls').onDelete('CASCADE');
    table.uuid('option_id').notNullable().references('id').inTable('poll_options').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['poll_id', 'user_id'], 'poll_votes_poll_user_unique');
  });

  await knex.schema.createTable('moderation_flags', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('content_type', 20).notNullable();
    table.uuid('content_id').notNullable();
    table.uuid('reported_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.decimal('ai_confidence', 3, 2).nullable();
    table.string('ai_reason', 100).nullable();
    table.enu('flag_type', ['ai_auto', 'user_report'], {
      useNative: false,
      enumName: 'moderation_flag_type_enum',
    }).notNullable();
    table.enu('status', ['pending', 'resolved_approved', 'resolved_rejected', 'escalated'], {
      useNative: false,
      enumName: 'moderation_flag_status_enum',
    }).notNullable().defaultTo('pending');
    table.uuid('reviewed_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at', { useTz: true }).nullable();
    table.text('resolution_note').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('moderation_appeals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('moderation_flag_id').notNullable().references('id').inTable('moderation_flags').onDelete('CASCADE');
    table.uuid('appealed_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('reason').notNullable();
    table.enu('status', ['pending', 'approved', 'denied'], {
      useNative: false,
      enumName: 'moderation_appeal_status_enum',
    }).notNullable().defaultTo('pending');
    table.uuid('reviewed_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at', { useTz: true }).nullable();
  });

  await knex.schema.createTable('user_restrictions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').unique('user_restrictions_user_unique');
    table.enu('restriction_type', ['post_ban', 'comment_ban', 'full_ban'], {
      useNative: false,
      enumName: 'user_restriction_type_enum',
    }).notNullable();
    table.text('reason').notNullable();
    table.uuid('imposed_by').notNullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('starts_at', { useTz: true }).notNullable();
    table.timestamp('ends_at', { useTz: true }).nullable();
    table.boolean('active').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('notifications', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('recipient_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable();
    table.string('title', 200).nullable();
    table.text('body').nullable();
    table.jsonb('data').nullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['recipient_id', 'is_read', 'created_at'], 'notifications_recipient_read_created_idx');
  });

  await knex.schema.createTable('email_log', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('notification_type', 50).nullable();
    table.timestamp('sent_at', { useTz: true }).nullable();
    table.string('status', 20).nullable();
  });

  await knex.schema.createTable('achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('code', 50).notNullable().unique();
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.string('icon_url', 500).nullable();
    table.enu('category', ['member', 'club'], {
      useNative: false,
      enumName: 'achievement_category_enum',
    }).notNullable();
  });

  await knex.schema.createTable('user_achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('club_id').nullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.uuid('achievement_id').notNullable().references('id').inTable('achievements').onDelete('CASCADE');
    table.timestamp('awarded_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.uuid('target_entity_id').nullable();
  });

  await knex.schema.createTable('club_achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.uuid('achievement_id').notNullable().references('id').inTable('achievements').onDelete('CASCADE');
    table.timestamp('awarded_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('budgets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE').unique('budgets_club_unique');
    table.decimal('total_allocated', 10, 2).nullable();
    table.decimal('current_balance', 10, 2).nullable();
  });

  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.enu('type', ['income', 'expense'], {
      useNative: false,
      enumName: 'transaction_type_enum',
    }).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('category', 50).nullable();
    table.text('description').nullable();
    table.string('receipt_url', 500).nullable();
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.enu('status', ['pending', 'approved', 'rejected'], {
      useNative: false,
      enumName: 'transaction_status_enum',
    }).notNullable();
    table.uuid('approved_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('surveys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').nullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.enu('target_audience', ['members', 'event_attendees', 'all_students'], {
      useNative: false,
      enumName: 'survey_target_audience_enum',
    }).notNullable();
    table.uuid('event_id').nullable().references('id').inTable('events').onDelete('CASCADE');
    table.enu('status', ['draft', 'published', 'closed'], {
      useNative: false,
      enumName: 'survey_status_enum',
    }).notNullable().defaultTo('draft');
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.createTable('survey_questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('survey_id').notNullable().references('id').inTable('surveys').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.enu('question_type', ['text', 'single_choice', 'multi_choice', 'rating'], {
      useNative: false,
      enumName: 'survey_question_type_enum',
    }).notNullable();
    table.jsonb('options').nullable();
    table.boolean('required').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('survey_responses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('survey_id').notNullable().references('id').inTable('surveys').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('submitted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('survey_answers', (table) => {
    table.uuid('response_id').notNullable().references('id').inTable('survey_responses').onDelete('CASCADE');
    table.uuid('question_id').notNullable().references('id').inTable('survey_questions').onDelete('CASCADE');
    table.text('answer_text').nullable();
    table.specificType('answer_option_ids', 'uuid[]').nullable();
    table.primary(['response_id', 'question_id']);
  });

  await knex.schema.createTable('audit_logs', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    table.uuid('actor_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('target_type', 50).notNullable();
    table.uuid('target_id').nullable();
    table.string('action', 50).notNullable();
    table.jsonb('old_value').nullable();
    table.jsonb('new_value').nullable();
    table.specificType('ip_address', 'inet').notNullable();
    table.timestamp('timestamp', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['university_id'], 'audit_logs_university_id_idx');
  });

  await knex.schema.createTable('feature_flags', (table) => {
    table.uuid('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    table.string('flag_name', 100).notNullable();
    table.boolean('enabled').notNullable().defaultTo(false);
    table.jsonb('value').nullable();
    table.primary(['university_id', 'flag_name']);
  });

  await knex.schema.createTable('recommendation_cache', (table) => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.float('score').notNullable();
    table.text('explanation').nullable();
    table.timestamp('generated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(['user_id', 'club_id']);
  });

  await knex.schema.createTable('club_activity_reports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    table.string('report_type', 50).notNullable();
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.text('content_markdown').notNullable();
    table.enu('status', ['draft', 'published'], {
      useNative: false,
      enumName: 'report_status_enum',
    }).notNullable().defaultTo('draft');
    table.uuid('generated_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('survey_insights', (table) => {
    table.uuid('survey_id').primary().references('id').inTable('surveys').onDelete('CASCADE');
    table.text('summary').nullable();
    table.jsonb('sentiment_distribution').nullable();
    table.jsonb('themes').nullable();
    table.timestamp('generated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  const tablesInReverseOrder = [
    'survey_insights',
    'club_activity_reports',
    'recommendation_cache',
    'feature_flags',
    'audit_logs',
    'survey_answers',
    'survey_responses',
    'survey_questions',
    'surveys',
    'transactions',
    'budgets',
    'club_achievements',
    'user_achievements',
    'achievements',
    'email_log',
    'notifications',
    'user_restrictions',
    'moderation_appeals',
    'moderation_flags',
    'poll_votes',
    'poll_options',
    'polls',
    'comments',
    'posts',
    'attendance_records',
    'event_rsvps',
    'events',
    'project_likes',
    'project_external_links',
    'project_collaborators',
    'project_media',
    'projects',
    'membership_requests',
    'club_role_definitions',
    'club_memberships',
    'club_registration_requests',
    'club_media_gallery',
    'clubs',
    'users',
    'universities',
  ];

  for (const tableName of tablesInReverseOrder) {
    await knex.schema.dropTableIfExists(tableName);
  }

  const enumNames = [
    'report_status_enum',
    'survey_question_type_enum',
    'survey_status_enum',
    'survey_target_audience_enum',
    'transaction_status_enum',
    'transaction_type_enum',
    'achievement_category_enum',
    'user_restriction_type_enum',
    'moderation_appeal_status_enum',
    'moderation_flag_status_enum',
    'moderation_flag_type_enum',
    'comment_moderation_status_enum',
    'post_status_enum',
    'post_moderation_status_enum',
    'post_visibility_enum',
    'post_type_enum',
    'attendance_checkin_method_enum',
    'event_rsvp_status_enum',
    'event_status_enum',
    'event_visibility_enum',
    'event_type_enum',
    'project_media_type_enum',
    'project_visibility_enum',
    'project_status_enum',
    'membership_request_status_enum',
    'club_membership_status_enum',
    'club_registration_status_enum',
    'club_media_type_enum',
    'club_status_enum',
    'club_membership_policy_enum',
    'user_type_enum',
  ];

  for (const enumName of enumNames) {
    await knex.raw(`DROP TYPE IF EXISTS ${enumName}`);
  }

  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
