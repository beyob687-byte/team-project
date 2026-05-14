exports.seed = async function seed(knex) {
  await knex("survey_insights")
    .del()
    .catch(() => {});
  await knex("club_activity_reports")
    .del()
    .catch(() => {});
  await knex("recommendation_cache")
    .del()
    .catch(() => {});
  await knex("feature_flags")
    .del()
    .catch(() => {});
  await knex("audit_logs")
    .del()
    .catch(() => {});
  await knex("survey_answers")
    .del()
    .catch(() => {});
  await knex("survey_responses")
    .del()
    .catch(() => {});
  await knex("survey_questions")
    .del()
    .catch(() => {});
  await knex("surveys")
    .del()
    .catch(() => {});
  await knex("transactions")
    .del()
    .catch(() => {});
  await knex("budgets")
    .del()
    .catch(() => {});
  await knex("club_achievements")
    .del()
    .catch(() => {});
  await knex("user_achievements")
    .del()
    .catch(() => {});
  await knex("achievements")
    .del()
    .catch(() => {});
  await knex("email_log")
    .del()
    .catch(() => {});
  await knex("notifications")
    .del()
    .catch(() => {});
  await knex("user_restrictions")
    .del()
    .catch(() => {});
  await knex("moderation_appeals")
    .del()
    .catch(() => {});
  await knex("moderation_flags")
    .del()
    .catch(() => {});
  await knex("poll_votes")
    .del()
    .catch(() => {});
  await knex("poll_options")
    .del()
    .catch(() => {});
  await knex("polls")
    .del()
    .catch(() => {});
  await knex("comments")
    .del()
    .catch(() => {});
  await knex("posts")
    .del()
    .catch(() => {});
  await knex("attendance_records")
    .del()
    .catch(() => {});
  await knex("event_rsvps")
    .del()
    .catch(() => {});
  await knex("events")
    .del()
    .catch(() => {});
  await knex("project_likes")
    .del()
    .catch(() => {});
  await knex("project_external_links")
    .del()
    .catch(() => {});
  await knex("project_collaborators")
    .del()
    .catch(() => {});
  await knex("project_media")
    .del()
    .catch(() => {});
  await knex("projects")
    .del()
    .catch(() => {});
  await knex("membership_requests")
    .del()
    .catch(() => {});
  await knex("club_role_definitions")
    .del()
    .catch(() => {});
  await knex("club_memberships")
    .del()
    .catch(() => {});
  await knex("club_registration_requests")
    .del()
    .catch(() => {});
  await knex("club_media_gallery")
    .del()
    .catch(() => {});
  await knex("clubs")
    .del()
    .catch(() => {});
  await knex("users")
    .del()
    .catch(() => {});
  await knex("universities")
    .del()
    .catch(() => {});

  const universityId = "00000000-0000-0000-0000-000000000001";

  await knex("universities").insert([
    {
      id: universityId,
      name: "UniClubs Placeholder University",
      short_name: "UCPU",
      domain: "example.edu",
      logo_url: null,
      active: true,
      settings: JSON.stringify({
        feature_flags: {
          ai_moderation: true,
          ai_recommendations: true,
          ai_reports: true,
        },
        retention_years: 3,
      }),
    },
  ]);

  await knex("achievements").insert([
    {
      code: "event_enthusiast",
      name: "Event Enthusiast",
      description:
        "Attended many club events and stayed active in the community.",
      icon_url: null,
      category: "member",
    },
    {
      code: "early_bird",
      name: "Early Bird",
      description: "Was among the first to RSVP or join new opportunities.",
      icon_url: null,
      category: "member",
    },
    {
      code: "connector",
      name: "Connector",
      description: "Helped connect people, clubs, or projects together.",
      icon_url: null,
      category: "member",
    },
    {
      code: "feedback_guru",
      name: "Feedback Guru",
      description: "Provided useful feedback through surveys and reviews.",
      icon_url: null,
      category: "member",
    },
    {
      code: "rising_star",
      name: "Rising Star",
      description: "Showed outstanding early participation and promise.",
      icon_url: null,
      category: "member",
    },
    {
      code: "community_builder",
      name: "Community Builder",
      description: "Helped strengthen the club community and engagement.",
      icon_url: null,
      category: "club",
    },
  ]);
};
