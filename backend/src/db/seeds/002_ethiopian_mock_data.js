const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for referential consistency
const UNIVERSITY_ID = "a1a1a1a1-1111-4111-1111-111111111111";
const USER_IDS = {
  admin: "b0b0b0b0-1111-4111-1111-111111111111",
  abebe: "b1b1b1b1-1111-4111-1111-111111111111",
  tigist: "b2b2b2b2-1111-4111-1111-111111111111",
  yonas: "b3b3b3b3-1111-4111-1111-111111111111",
  meron: "b4b4b4b4-1111-4111-1111-111111111111",
  samuel: "b5b5b5b5-1111-4111-1111-111111111111",
  hanna: "b6b6b6b6-1111-4111-1111-111111111111",
  dawit: "b7b7b7b7-1111-4111-1111-111111111111",
  feven: "b8b8b8b8-1111-4111-1111-111111111111",
  abraham: "b9b9b9b9-1111-4111-1111-111111111111",
  ruth: "c1c1c1c1-1111-4111-1111-111111111111",
  nebiat: "c2c2c2c2-1111-4111-1111-111111111111",
  senait: "c3c3c3c3-1111-4111-1111-111111111111",
  abel: "c4c4c4c4-1111-4111-1111-111111111111",
  marta: "c5c5c5c5-1111-4111-1111-111111111111",
  yohannes: "c6c6c6c6-1111-4111-1111-111111111111",
  betelhem: "c7c7c7c7-1111-4111-1111-111111111111",
  kaleab: "c8c8c8c8-1111-4111-1111-111111111111",
  rahel: "c9c9c9c9-1111-4111-1111-111111111111",
  ermias: "d1d1d1d1-1111-4111-1111-111111111111",
  lidya: "d2d2d2d2-1111-4111-1111-111111111111",
};

const CLUB_IDS = {
  cultural: "e1e1e1e1-1111-4111-1111-111111111111",
  tech: "e2e2e2e2-1111-4111-1111-111111111111",
  engineering: "e3e3e3e3-1111-4111-1111-111111111111",
  debating: "e4e4e4e4-1111-4111-1111-111111111111",
  community: "e5e5e5e5-1111-4111-1111-111111111111",
};

const POST_IDS = {
  cultural: "81111111-1111-4111-8111-111111111111",
  tech_promo: "82222222-2222-4222-8222-222222222222",
  engineering: "83333333-3333-4333-8333-333333333333",
  debating: "84444444-4444-4444-8444-444444444444",
  community: "85555555-5555-4555-8555-555555555555",
  tech_poll: "86666666-6666-4666-8666-666666666666",
};

const POLL_ID = "97777777-7777-4777-8777-777777777777";

const POLL_OPTION_IDS = {
  react: "a1111111-1111-4111-8111-111111111111",
  flutter: "a2222222-2222-4222-8222-222222222222",
  ml: "a3333333-3333-4333-8333-333333333333",
};

const MODERATION_FLAG_ID = "b1111111-1111-4111-8111-111111111111";

const EVENT_IDS = {
  cultural_night: "f1f1f1f1-1111-4111-1111-111111111111",
  hackathon: "f2f2f2f2-1111-4111-1111-111111111111",
  engineering_expo: "f3f3f3f3-1111-4111-1111-111111111111",
  debate_workshop: "f4f4f4f4-1111-4111-1111-111111111111",
  community_cleanup: "f5f5f5f5-1111-4111-1111-111111111111",
  guest_lecture: "f6f6f6f6-1111-4111-1111-111111111111",
};

const PROJECT_IDS = {
  amharic_website: "c1111111-1111-4111-8111-111111111111",
  mobile_app: "c2222222-2222-4222-8222-222222222222",
  solar_charger: "c3333333-3333-4333-8333-333333333333",
};

exports.seed = async function (knex) {
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 12);

  // Truncate all tables in correct order (child first)
  await knex("survey_answers").del();
  await knex("survey_responses").del();
  await knex("survey_questions").del();
  await knex("surveys").del();
  await knex("transactions").del();
  await knex("budgets").del();
  await knex("user_achievements").del();
  await knex("club_achievements").del();
  await knex("achievements").del();
  await knex("email_log").del();
  await knex("notifications").del();
  await knex("moderation_appeals").del();
  await knex("moderation_flags").del();
  await knex("poll_votes").del();
  await knex("poll_options").del();
  await knex("polls").del();
  await knex("comments").del();
  await knex("posts").del();
  await knex("attendance_records").del();
  await knex("event_rsvps").del();
  await knex("events").del();
  await knex("project_external_links").del();
  await knex("project_collaborators").del();
  await knex("project_media").del();
  await knex("project_likes").del();
  await knex("projects").del();
  await knex("membership_requests").del();
  await knex("club_role_definitions").del();
  await knex("club_memberships").del();
  await knex("club_registration_requests").del();
  await knex("club_media_gallery").del();
  await knex("clubs").del();
  await knex("user_restrictions").del();
  await knex("users").del();
  await knex("universities").del();
  await knex("feature_flags").del();
  await knex("recommendation_cache").del();
  await knex("club_activity_reports").del();
  await knex("survey_insights").del();
  await knex("audit_logs").del();

  // 1. Insert university
  await knex("universities").insert({
    id: UNIVERSITY_ID,
    name: "Addis Ababa University",
    short_name: "AAU",
    domain: "aau.edu.et",
    logo_url: "https://example.com/aau-logo.png",
    active: true,
    settings: {
      features: { finance: true, gamification: true },
      data_retention: "2 years",
      default_locale: "am",
    },
    created_at: new Date("2020-01-01"),
    updated_at: new Date("2024-09-01"),
  });

  // 2. Insert users (students)
  const users = [
    {
      id: USER_IDS.admin,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-admin-001",
      email: "admin@aau.edu.et",
      first_name: "Alem",
      last_name: "Tsegaye",
      student_id: null,
      user_type: "admin",
      major: null,
      department: "Student Affairs",
      enrollment_status: "active",
      interests: ["administration", "student life", "policy"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-01-15"),
      last_login: new Date("2025-05-14"),
      password_hash: adminPasswordHash,
    },
    {
      id: USER_IDS.abebe,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-001",
      email: "abebe.kebede@aau.edu.et",
      first_name: "Abebe",
      last_name: "Kebede",
      student_id: "UGR/00123/12",
      user_type: "student",
      major: "Computer Science",
      department: "Computer Science",
      enrollment_status: "active",
      interests: ["coding", "technology", "music"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-10"),
      last_login: new Date("2025-05-10"),
    },
    {
      id: USER_IDS.tigist,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-002",
      email: "tigist.haile@aau.edu.et",
      first_name: "Tigist",
      last_name: "Haile",
      student_id: "UGR/00456/13",
      user_type: "student",
      major: "Electrical Engineering",
      department: "Electrical & Computer Engineering",
      enrollment_status: "active",
      interests: ["engineering", "innovation", "reading"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-09-10"),
      last_login: new Date("2025-05-11"),
    },
    {
      id: USER_IDS.yonas,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-003",
      email: "yonas.assefa@aau.edu.et",
      first_name: "Yonas",
      last_name: "Assefa",
      student_id: "UGR/00789/12",
      user_type: "student",
      major: "Computer Science",
      department: "Computer Science",
      enrollment_status: "active",
      interests: ["programming", "AI", "football"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-12"),
      last_login: new Date("2025-05-09"),
    },
    {
      id: USER_IDS.meron,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-004",
      email: "meron.gebru@aau.edu.et",
      first_name: "Meron",
      last_name: "Gebru",
      student_id: "UGR/00234/14",
      user_type: "student",
      major: "Accounting",
      department: "Accounting & Finance",
      enrollment_status: "active",
      interests: ["finance", "entrepreneurship", "dance"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-11"),
      last_login: new Date("2025-05-12"),
    },
    {
      id: USER_IDS.samuel,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-005",
      email: "samuel.tadesse@aau.edu.et",
      first_name: "Samuel",
      last_name: "Tadesse",
      student_id: "UGR/00567/13",
      user_type: "student",
      major: "Mechanical Engineering",
      department: "Mechanical Engineering",
      enrollment_status: "active",
      interests: ["cars", "3d printing", "robotics"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-13"),
      last_login: new Date("2025-05-08"),
    },
    {
      id: USER_IDS.hanna,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-006",
      email: "hanna.mulugeta@aau.edu.et",
      first_name: "Hanna",
      last_name: "Mulugeta",
      student_id: "UGR/00890/12",
      user_type: "student",
      major: "Law",
      department: "School of Law",
      enrollment_status: "active",
      interests: ["debate", "human rights", "poetry"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-09-14"),
      last_login: new Date("2025-05-11"),
    },
    {
      id: USER_IDS.dawit,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-007",
      email: "dawit.tesfaye@aau.edu.et",
      first_name: "Dawit",
      last_name: "Tesfaye",
      student_id: "UGR/00111/14",
      user_type: "student",
      major: "Architecture",
      department: "Architecture & Urban Planning",
      enrollment_status: "active",
      interests: ["design", "photography", "travel"],
      notification_preferences: {
        email: true,
        in_app: true,
        digest: "monthly",
      },
      created_at: new Date("2023-09-15"),
      last_login: new Date("2025-05-07"),
    },
    {
      id: USER_IDS.feven,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-008",
      email: "feven.berhe@aau.edu.et",
      first_name: "Feven",
      last_name: "Berhe",
      student_id: "UGR/00222/13",
      user_type: "student",
      major: "Medicine",
      department: "School of Medicine",
      enrollment_status: "active",
      interests: ["health", "community service", "research"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-16"),
      last_login: new Date("2025-05-10"),
    },
    {
      id: USER_IDS.abraham,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-009",
      email: "abraham.haile@aau.edu.et",
      first_name: "Abraham",
      last_name: "Haile",
      student_id: "UGR/00333/12",
      user_type: "student",
      major: "Economics",
      department: "Economics",
      enrollment_status: "active",
      interests: ["policy", "writing", "soccer"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-17"),
      last_login: new Date("2025-05-12"),
    },
    {
      id: USER_IDS.ruth,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-010",
      email: "ruth.mekonnen@aau.edu.et",
      first_name: "Ruth",
      last_name: "Mekonnen",
      student_id: "UGR/00444/14",
      user_type: "student",
      major: "Business Administration",
      department: "Business & Management",
      enrollment_status: "active",
      interests: ["marketing", "leadership", "volunteering"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-09-18"),
      last_login: new Date("2025-05-09"),
    },
    {
      id: USER_IDS.nebiat,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-011",
      email: "nebiat.asfaw@aau.edu.et",
      first_name: "Nebiat",
      last_name: "Asfaw",
      student_id: "UGR/00555/13",
      user_type: "student",
      major: "Civil Engineering",
      department: "Civil Engineering",
      enrollment_status: "active",
      interests: ["construction", "sustainability", "cooking"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-19"),
      last_login: new Date("2025-05-06"),
    },
    {
      id: USER_IDS.senait,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-012",
      email: "senait.negash@aau.edu.et",
      first_name: "Senait",
      last_name: "Negash",
      student_id: "UGR/00666/12",
      user_type: "student",
      major: "English Literature",
      department: "English",
      enrollment_status: "active",
      interests: ["literature", "creative writing", "theater"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-20"),
      last_login: new Date("2025-05-11"),
    },
    {
      id: USER_IDS.abel,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-013",
      email: "abel.negatu@aau.edu.et",
      first_name: "Abel",
      last_name: "Negatu",
      student_id: "UGR/00777/14",
      user_type: "student",
      major: "Software Engineering",
      department: "Computer Science",
      enrollment_status: "active",
      interests: ["web development", "mobile apps", "gaming"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-09-21"),
      last_login: new Date("2025-05-12"),
    },
    {
      id: USER_IDS.marta,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-014",
      email: "marta.tesema@aau.edu.et",
      first_name: "Marta",
      last_name: "Tesema",
      student_id: "UGR/00888/13",
      user_type: "student",
      major: "Environmental Science",
      department: "Environmental Science",
      enrollment_status: "active",
      interests: ["climate", "nature", "hiking"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-22"),
      last_login: new Date("2025-05-10"),
    },
    {
      id: USER_IDS.yohannes,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-015",
      email: "yohannes.alemu@aau.edu.et",
      first_name: "Yohannes",
      last_name: "Alemu",
      student_id: "UGR/00999/12",
      user_type: "student",
      major: "Physics",
      department: "Physics",
      enrollment_status: "active",
      interests: ["astronomy", "data science", "chess"],
      notification_preferences: {
        email: true,
        in_app: true,
        digest: "monthly",
      },
      created_at: new Date("2023-09-23"),
      last_login: new Date("2025-05-09"),
    },
    {
      id: USER_IDS.betelhem,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-016",
      email: "betelhem.ali@aau.edu.et",
      first_name: "Betelhem",
      last_name: "Ali",
      student_id: "UGR/01000/14",
      user_type: "student",
      major: "Pharmacy",
      department: "Pharmacy",
      enrollment_status: "active",
      interests: ["chemistry", "public health", "gaming"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-24"),
      last_login: new Date("2025-05-08"),
    },
    {
      id: USER_IDS.kaleab,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-017",
      email: "kaleab.tiruneh@aau.edu.et",
      first_name: "Kaleab",
      last_name: "Tiruneh",
      student_id: "UGR/01111/13",
      user_type: "student",
      major: "Sociology",
      department: "Sociology & Social Anthropology",
      enrollment_status: "active",
      interests: ["community development", "art", "music"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-25"),
      last_login: new Date("2025-05-07"),
    },
    {
      id: USER_IDS.rahel,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-018",
      email: "rahel.hailemariam@aau.edu.et",
      first_name: "Rahel",
      last_name: "Hailemariam",
      student_id: "UGR/01222/12",
      user_type: "student",
      major: "Political Science",
      department: "Political Science & International Relations",
      enrollment_status: "active",
      interests: ["diplomacy", "debate", "reading"],
      notification_preferences: { email: true, in_app: true, digest: "daily" },
      created_at: new Date("2023-09-26"),
      last_login: new Date("2025-05-11"),
    },
    {
      id: USER_IDS.ermias,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-019",
      email: "ermias.gebeyehu@aau.edu.et",
      first_name: "Ermias",
      last_name: "Gebeyehu",
      student_id: "UGR/01333/14",
      user_type: "student",
      major: "Information Technology",
      department: "Information Technology",
      enrollment_status: "active",
      interests: ["cybersecurity", "networking", "soccer"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-27"),
      last_login: new Date("2025-05-12"),
    },
    {
      id: USER_IDS.lidya,
      university_id: UNIVERSITY_ID,
      sso_id: "aau-020",
      email: "lidya.biruk@aau.edu.et",
      first_name: "Lidya",
      last_name: "Biruk",
      student_id: "UGR/01444/13",
      user_type: "student",
      major: "Psychology",
      department: "Psychology",
      enrollment_status: "active",
      interests: ["mental health", "counseling", "music"],
      notification_preferences: { email: true, in_app: true, digest: "weekly" },
      created_at: new Date("2023-09-28"),
      last_login: new Date("2025-05-10"),
    },
  ];
  const normalizedUsers = users.map(({ sso_id, password_hash, ...user }) => ({
    ...user,
    external_auth_id: sso_id,
    password_hash: password_hash ?? null,
  }));
  await knex("users").insert(normalizedUsers);

  // 3. Insert clubs
  const clubs = [
    {
      id: CLUB_IDS.cultural,
      university_id: UNIVERSITY_ID,
      name: "Ethiopian Cultural Club",
      short_name: "ECC",
      category: "Cultural",
      secondary_categories: ["Arts", "Music"],
      mission_statement:
        "To celebrate and promote Ethiopian culture, traditions, and diversity within the university community.",
      logo_url: "https://example.com/ecc-logo.png",
      cover_photo_url: "https://example.com/ecc-cover.jpg",
      contact_email: "culturalclub@aau.edu.et",
      social_links: {
        instagram: "@aau_cultural",
        telegram: "t.me/aau_cultural",
      },
      membership_policy: "approval",
      recruiting_status: true,
      status: "active",
      constitution_url: "https://example.com/ecc-constitution.pdf",
      faculty_advisor_name: "Dr. Mulugeta Tefera",
      faculty_advisor_email: "mulugeta.tefera@aau.edu.et",
      meeting_schedule: {
        day: "Monday",
        time: "5:00 PM",
        location: "Student Center Room 101",
        frequency: "weekly",
      },
      tags: ["culture", "dance", "music", "heritage"],
      created_at: new Date("2022-01-15"),
      updated_at: new Date("2024-01-10"),
    },
    {
      id: CLUB_IDS.tech,
      university_id: UNIVERSITY_ID,
      name: "AAU Tech Club",
      short_name: "TechC",
      category: "Technology",
      secondary_categories: ["Computer Science", "Engineering"],
      mission_statement:
        "Empowering students with technical skills through workshops, hackathons, and collaborative projects.",
      logo_url: "https://example.com/techc-logo.png",
      cover_photo_url: "https://example.com/techc-cover.jpg",
      contact_email: "techclub@aau.edu.et",
      social_links: { github: "aau-tech-club", twitter: "@aau_tech" },
      membership_policy: "open",
      recruiting_status: true,
      status: "active",
      constitution_url: null,
      faculty_advisor_name: "Dr. Tewodros Lemma",
      faculty_advisor_email: "tewodros.lemma@aau.edu.et",
      meeting_schedule: {
        day: "Wednesday",
        time: "4:00 PM",
        location: "Science Building Lab 3",
        frequency: "weekly",
      },
      tags: ["programming", "hackathon", "workshops", "AI"],
      created_at: new Date("2021-09-01"),
      updated_at: new Date("2024-02-20"),
    },
    {
      id: CLUB_IDS.engineering,
      university_id: UNIVERSITY_ID,
      name: "Engineering Society",
      short_name: "EngSoc",
      category: "Academic",
      secondary_categories: ["Engineering"],
      mission_statement:
        "Fostering innovation and hands-on experience in engineering disciplines.",
      logo_url: "https://example.com/engsoc-logo.png",
      contact_email: "engsoc@aau.edu.et",
      membership_policy: "approval",
      recruiting_status: true,
      status: "active",
      tags: ["mechanical", "civil", "electrical", "projects"],
      created_at: new Date("2020-03-10"),
      updated_at: new Date("2024-05-05"),
    },
    {
      id: CLUB_IDS.debating,
      university_id: UNIVERSITY_ID,
      name: "Debating & Public Speaking",
      short_name: "DPS",
      category: "Academic",
      mission_statement:
        "Developing critical thinking and public speaking skills through debate competitions and workshops.",
      logo_url: "https://example.com/dps-logo.png",
      contact_email: "debating@aau.edu.et",
      membership_policy: "invite_only",
      recruiting_status: false,
      status: "active",
      meeting_schedule: {
        day: "Thursday",
        time: "6:00 PM",
        location: "Arts Hall 201",
        frequency: "biweekly",
      },
      tags: ["debate", "public speaking", "leadership"],
      created_at: new Date("2021-11-05"),
      updated_at: new Date("2023-12-15"),
    },
    {
      id: CLUB_IDS.community,
      university_id: UNIVERSITY_ID,
      name: "Community Service League",
      short_name: "CSL",
      category: "Social Service",
      secondary_categories: ["Volunteer"],
      mission_statement:
        "Serving the community through outreach programs, cleanups, and educational initiatives.",
      logo_url: "https://example.com/csl-logo.png",
      contact_email: "community@aau.edu.et",
      membership_policy: "open",
      recruiting_status: true,
      status: "active",
      tags: ["volunteering", "cleanup", "teaching"],
      created_at: new Date("2022-06-20"),
      updated_at: new Date("2024-04-01"),
    },
  ];
  await knex("clubs").insert(clubs);

  // 4. Club memberships (assign presidents, officers, some members)
  const memberships = [
    // Cultural Club
    {
      user_id: USER_IDS.senait,
      club_id: CLUB_IDS.cultural,
      role: "president",
      status: "active",
    },
    {
      user_id: USER_IDS.kaleab,
      club_id: CLUB_IDS.cultural,
      role: "vice_president",
      status: "active",
    },
    {
      user_id: USER_IDS.hanna,
      club_id: CLUB_IDS.cultural,
      role: "secretary",
      status: "active",
    },
    {
      user_id: USER_IDS.ruth,
      club_id: CLUB_IDS.cultural,
      role: "member",
      status: "active",
    },
    {
      user_id: USER_IDS.lidya,
      club_id: CLUB_IDS.cultural,
      role: "member",
      status: "active",
    },
    // Tech Club
    {
      user_id: USER_IDS.abebe,
      club_id: CLUB_IDS.tech,
      role: "president",
      status: "active",
    },
    {
      user_id: USER_IDS.yonas,
      club_id: CLUB_IDS.tech,
      role: "event_coordinator",
      status: "active",
    },
    {
      user_id: USER_IDS.abel,
      club_id: CLUB_IDS.tech,
      role: "member",
      status: "active",
    },
    {
      user_id: USER_IDS.ermias,
      club_id: CLUB_IDS.tech,
      role: "member",
      status: "active",
    },
    // Engineering Society
    {
      user_id: USER_IDS.tigist,
      club_id: CLUB_IDS.engineering,
      role: "president",
      status: "active",
    },
    {
      user_id: USER_IDS.samuel,
      club_id: CLUB_IDS.engineering,
      role: "vice_president",
      status: "active",
    },
    {
      user_id: USER_IDS.nebiat,
      club_id: CLUB_IDS.engineering,
      role: "member",
      status: "active",
    },
    // Debating
    {
      user_id: USER_IDS.hanna,
      club_id: CLUB_IDS.debating,
      role: "president",
      status: "active",
    },
    {
      user_id: USER_IDS.rahel,
      club_id: CLUB_IDS.debating,
      role: "secretary",
      status: "active",
    },
    {
      user_id: USER_IDS.abel,
      club_id: CLUB_IDS.debating,
      role: "member",
      status: "active",
    },
    // Community Service
    {
      user_id: USER_IDS.feven,
      club_id: CLUB_IDS.community,
      role: "president",
      status: "active",
    },
    {
      user_id: USER_IDS.marta,
      club_id: CLUB_IDS.community,
      role: "vice_president",
      status: "active",
    },
    {
      user_id: USER_IDS.betelhem,
      club_id: CLUB_IDS.community,
      role: "member",
      status: "active",
    },
    {
      user_id: USER_IDS.dawit,
      club_id: CLUB_IDS.community,
      role: "member",
      status: "active",
    },
  ];
  await knex("club_memberships").insert(memberships);

  // 5. Events
  const events = [
    {
      id: EVENT_IDS.cultural_night,
      club_id: CLUB_IDS.cultural,
      title: "Ethiopian Cultural Night 2025",
      description:
        "A vibrant evening showcasing traditional dances, music, and cuisines from various Ethiopian regions. Come celebrate diversity!",
      event_type: "in_person",
      location: "AAU Main Auditorium",
      start_datetime: new Date("2025-06-20T18:00:00+03:00"),
      end_datetime: new Date("2025-06-20T22:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "public",
      rsvp_required: true,
      rsvp_opens_at: new Date("2025-05-20T08:00:00+03:00"),
      rsvp_closes_at: new Date("2025-06-19T23:59:59+03:00"),
      capacity: 500,
      waitlist_enabled: true,
      custom_rsvp_questions: JSON.stringify([
        { label: "Will you bring a cultural dish?", type: "text" },
      ]),
      checkin_method: JSON.stringify({ manual: true, qr: true }),
      status: "published",
      created_by: USER_IDS.senait,
      created_at: new Date("2025-05-01"),
    },
    {
      id: EVENT_IDS.hackathon,
      club_id: CLUB_IDS.tech,
      title: "AAU Hackathon 3.0",
      description:
        "A 24-hour coding competition. Form teams, build innovative solutions, and win prizes! Sponsored by local tech companies.",
      event_type: "in_person",
      location: "AAU Science Library Hall",
      start_datetime: new Date("2025-07-10T09:00:00+03:00"),
      end_datetime: new Date("2025-07-11T09:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "public",
      rsvp_required: true,
      rsvp_opens_at: new Date("2025-06-10T08:00:00+03:00"),
      rsvp_closes_at: new Date("2025-07-08T20:00:00+03:00"),
      capacity: 150,
      waitlist_enabled: true,
      checkin_method: JSON.stringify({ qr: true, self_code: true }),
      status: "published",
      created_by: USER_IDS.abebe,
      created_at: new Date("2025-05-15"),
    },
    {
      id: EVENT_IDS.engineering_expo,
      club_id: CLUB_IDS.engineering,
      title: "Engineering Innovation Expo",
      description:
        "Display your projects and prototypes. Network with industry professionals. Prizes for best design.",
      event_type: "in_person",
      location: "Engineering Campus Grounds",
      start_datetime: new Date("2025-08-15T10:00:00+03:00"),
      end_datetime: new Date("2025-08-15T16:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "public",
      rsvp_required: false,
      status: "published",
      created_by: USER_IDS.tigist,
      created_at: new Date("2025-07-01"),
    },
    {
      id: EVENT_IDS.debate_workshop,
      club_id: CLUB_IDS.debating,
      title: "Public Speaking & Debate Workshop",
      description:
        "Interactive workshop with experienced debaters. Improve your argumentation and presentation skills.",
      event_type: "in_person",
      location: "Arts Hall Room 305",
      start_datetime: new Date("2025-06-05T15:00:00+03:00"),
      end_datetime: new Date("2025-06-05T18:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "club_members",
      rsvp_required: true,
      rsvp_opens_at: new Date("2025-05-25T08:00:00+03:00"),
      rsvp_closes_at: new Date("2025-06-04T18:00:00+03:00"),
      capacity: 30,
      status: "published",
      created_by: USER_IDS.hanna,
      created_at: new Date("2025-05-12"),
    },
    {
      id: EVENT_IDS.community_cleanup,
      club_id: CLUB_IDS.community,
      title: "Campus Cleanup & Recycling Drive",
      description:
        "Join us to beautify our campus and promote recycling. Gloves and bags provided.",
      event_type: "in_person",
      location: "AAU Main Campus",
      start_datetime: new Date("2025-06-01T08:00:00+03:00"),
      end_datetime: new Date("2025-06-01T12:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "public",
      rsvp_required: false,
      status: "published",
      created_by: USER_IDS.feven,
      created_at: new Date("2025-05-18"),
    },
    {
      id: EVENT_IDS.guest_lecture,
      club_id: CLUB_IDS.tech,
      title: "Guest Lecture: AI in Ethiopian Agriculture",
      description:
        "Dr. Solomon Gizaw from the Ethiopian AI Institute will discuss practical applications of AI in farming.",
      event_type: "hybrid",
      location: "AAU Lecture Hall 4 / Virtual",
      virtual_meeting_link: "https://meet.google.com/abc-defg-hij",
      start_datetime: new Date("2025-07-25T16:00:00+03:00"),
      end_datetime: new Date("2025-07-25T18:00:00+03:00"),
      timezone: "Africa/Addis_Ababa",
      visibility: "public",
      rsvp_required: true,
      rsvp_opens_at: new Date("2025-07-01T08:00:00+03:00"),
      rsvp_closes_at: new Date("2025-07-24T12:00:00+03:00"),
      capacity: 200,
      waitlist_enabled: false,
      checkin_method: JSON.stringify({ qr: true, geo: false }),
      status: "published",
      created_by: USER_IDS.yonas,
      created_at: new Date("2025-06-10"),
    },
  ];
  await knex("events").insert(events);

  // 6. Posts (club announcements)
  const posts = [
    {
      id: POST_IDS.cultural,
      club_id: CLUB_IDS.cultural,
      author_id: USER_IDS.senait,
      post_type: "general",
      content:
        "🎉 Get ready for the Ethiopian Cultural Night 2025! Auditions for performers are open now. Contact the committee to participate. #Culture #AAU",
      images: ["https://example.com/cultural-night-flyer.jpg"],
      visibility: "public",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-05-02"),
    },
    {
      id: POST_IDS.tech_promo,
      club_id: CLUB_IDS.tech,
      author_id: USER_IDS.abebe,
      post_type: "event_promotion",
      content:
        "🚀 Hackathon 3.0 is coming! Registrations open June 10. Form your team and prepare for an amazing 24 hours. Prizes worth 50,000 ETB!",
      visibility: "public",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-05-16"),
    },
    {
      id: POST_IDS.engineering,
      club_id: CLUB_IDS.engineering,
      author_id: USER_IDS.tigist,
      post_type: "general",
      content:
        "Membership drive ongoing! Join Engineering Society and gain hands-on experience through workshops and industry visits. Open to all engineering students.",
      visibility: "public",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-04-01"),
    },
    {
      id: POST_IDS.debating,
      club_id: CLUB_IDS.debating,
      author_id: USER_IDS.hanna,
      post_type: "general",
      content:
        "Congratulations to our debaters for winning the regional championship! 🏆 Thank you all for the support.",
      visibility: "members_only",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-03-15"),
    },
    {
      id: POST_IDS.community,
      club_id: CLUB_IDS.community,
      author_id: USER_IDS.feven,
      post_type: "general",
      content:
        "This Saturday, we are visiting a local orphanage. We need volunteers to help with tutoring and games. DM to join!",
      visibility: "public",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-05-01"),
    },
    {
      id: POST_IDS.tech_poll,
      club_id: CLUB_IDS.tech,
      author_id: USER_IDS.yonas,
      post_type: "poll",
      content: "Which topic do you want for our next workshop?",
      visibility: "public",
      moderation_status: "approved",
      status: "published",
      published_at: new Date("2025-05-20"),
    },
  ];
  await knex("posts").insert(posts);

  // 7. Poll for the sixth post
  const poll = {
    id: POLL_ID,
    post_id: POST_IDS.tech_poll,
    question: "Which topic do you want for our next workshop?",
    results_visibility: "after_vote",
    multiple_choice: false,
  };
  await knex("polls").insert(poll);
  const pollOptions = [
    {
      id: POLL_OPTION_IDS.react,
      poll_id: POLL_ID,
      option_text: "Web Development with React",
      sort_order: 1,
    },
    {
      id: POLL_OPTION_IDS.flutter,
      poll_id: POLL_ID,
      option_text: "Mobile Apps using Flutter",
      sort_order: 2,
    },
    {
      id: POLL_OPTION_IDS.ml,
      poll_id: POLL_ID,
      option_text: "Machine Learning Basics",
      sort_order: 3,
    },
  ];
  await knex("poll_options").insert(pollOptions);
  // Some votes
  await knex("poll_votes").insert([
    {
      poll_id: POLL_ID,
      option_id: POLL_OPTION_IDS.react,
      user_id: USER_IDS.abel,
    },
    {
      poll_id: POLL_ID,
      option_id: POLL_OPTION_IDS.react,
      user_id: USER_IDS.ermias,
    },
    {
      poll_id: POLL_ID,
      option_id: POLL_OPTION_IDS.ml,
      user_id: USER_IDS.yonas,
    },
  ]);

  // 8. Projects
  const projects = [
    {
      id: PROJECT_IDS.amharic_website,
      club_id: CLUB_IDS.cultural,
      title: "Amharic Cultural Heritage Website",
      description:
        "A multilingual website documenting Ethiopian cultural practices, proverbs, and folklore. Built with React and Strapi.",
      start_date: "2024-09-01",
      end_date: "2025-01-15",
      status: "completed",
      visibility: "public",
      cover_image_url: "https://example.com/amharic-website.jpg",
      outcome:
        "Website launched with 100+ articles. Received university commendation.",
      created_by: USER_IDS.kaleab,
      created_at: new Date("2024-09-01"),
    },
    {
      id: PROJECT_IDS.mobile_app,
      club_id: CLUB_IDS.tech,
      title: "AAU Lost & Found Mobile App",
      description:
        "A Flutter app for students to report and search for lost items on campus. Uses Firestore for real-time updates.",
      start_date: "2025-01-10",
      end_date: null,
      status: "in_progress",
      visibility: "public",
      cover_image_url: "https://example.com/lost-found-app.png",
      created_by: USER_IDS.abebe,
      created_at: new Date("2025-01-10"),
    },
    {
      id: PROJECT_IDS.solar_charger,
      club_id: CLUB_IDS.engineering,
      title: "Portable Solar Phone Charger",
      description:
        "Design of a low-cost solar charger for rural students. Prototype built using locally sourced materials.",
      start_date: "2024-11-01",
      end_date: "2025-04-30",
      status: "completed",
      visibility: "public",
      cover_image_url: "https://example.com/solar-charger.jpg",
      outcome:
        "Prototype successfully charges phones. Plan to distribute 50 units to students in rural areas.",
      created_by: USER_IDS.tigist,
      created_at: new Date("2024-11-01"),
    },
  ];
  await knex("projects").insert(projects);

  // 9. Project collaborators
  await knex("project_collaborators").insert([
    {
      project_id: PROJECT_IDS.amharic_website,
      user_id: USER_IDS.senait,
      role: "Content Writer",
    },
    {
      project_id: PROJECT_IDS.amharic_website,
      user_id: USER_IDS.kaleab,
      role: "Developer",
    },
    {
      project_id: PROJECT_IDS.mobile_app,
      user_id: USER_IDS.abel,
      role: "UI/UX Designer",
    },
    {
      project_id: PROJECT_IDS.mobile_app,
      user_id: USER_IDS.yonas,
      role: "Backend Developer",
    },
    {
      project_id: PROJECT_IDS.solar_charger,
      user_id: USER_IDS.samuel,
      role: "Mechanical Designer",
    },
    {
      project_id: PROJECT_IDS.solar_charger,
      user_id: USER_IDS.nebiat,
      role: "Electrical Engineer",
    },
  ]);

  // 10. Achievements definitions (gamification)
  const achievements = [
    {
      code: "event_enthusiast",
      name: "Event Enthusiast",
      description: "Attended 10 events",
      category: "member",
    },
    {
      code: "early_bird",
      name: "Early Bird",
      description: "RSVPed to 5 events within the first hour",
      category: "member",
    },
    {
      code: "connector",
      name: "Connector",
      description: "Joined 3 or more clubs",
      category: "member",
    },
    {
      code: "feedback_guru",
      name: "Feedback Guru",
      description: "Completed 5 surveys",
      category: "member",
    },
    {
      code: "rising_star",
      name: "Rising Star",
      description: "Club membership grew by 50%",
      category: "club",
    },
    {
      code: "community_builder",
      name: "Community Builder",
      description: "Hosted 20 events",
      category: "club",
    },
  ];
  // generate UUIDs for achievements
  const achievementRecords = achievements.map((a) => ({ id: uuidv4(), ...a }));
  await knex("achievements").insert(achievementRecords);

  // 11. RSVPs for events (sample)
  await knex("event_rsvps").insert([
    {
      event_id: EVENT_IDS.cultural_night,
      user_id: USER_IDS.ruth,
      status: "registered",
      ticket_code: "TCKT-001",
    },
    {
      event_id: EVENT_IDS.cultural_night,
      user_id: USER_IDS.lidya,
      status: "registered",
      ticket_code: "TCKT-002",
    },
    {
      event_id: EVENT_IDS.hackathon,
      user_id: USER_IDS.abel,
      status: "registered",
      ticket_code: "TCKT-003",
    },
    {
      event_id: EVENT_IDS.hackathon,
      user_id: USER_IDS.ermias,
      status: "registered",
      ticket_code: "TCKT-004",
    },
    {
      event_id: EVENT_IDS.debate_workshop,
      user_id: USER_IDS.rahel,
      status: "registered",
      ticket_code: "TCKT-005",
    },
    {
      event_id: EVENT_IDS.guest_lecture,
      user_id: USER_IDS.abebe,
      status: "registered",
      ticket_code: "TCKT-006",
    },
  ]);

  // 12. Notifications for some users
  await knex("notifications").insert([
    {
      recipient_id: USER_IDS.abebe,
      type: "event_reminder",
      title: "Hackathon Registration Opens Tomorrow",
      body: "Get ready to register for AAU Hackathon 3.0 starting June 10.",
      data: { event_id: EVENT_IDS.hackathon },
      created_at: new Date("2025-06-09"),
    },
    {
      recipient_id: USER_IDS.senait,
      type: "membership_request",
      title: "New membership request",
      body: "Lidya Biruk wants to join Ethiopian Cultural Club.",
      data: { club_id: CLUB_IDS.cultural },
      created_at: new Date("2025-05-15"),
    },
  ]);

  // 13. Moderation flag (example of AI flag)
  await knex("moderation_flags").insert({
    id: MODERATION_FLAG_ID,
    content_type: "Post",
    content_id: POST_IDS.community,
    reported_by: null, // AI
    ai_confidence: 0.25,
    ai_reason: "mild_concern",
    flag_type: "ai_auto",
    status: "pending",
    created_at: new Date("2025-05-01"),
  });

  console.log("Ethiopian mock data inserted successfully.");
};
