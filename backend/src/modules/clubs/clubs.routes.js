const router = require("express").Router();
const catchAsync = require("../../utils/catchAsync");
const clubRoleMiddleware = require("../../middleware/clubRole");
const clubsController = require("./clubs.controller");

router.post("/register", catchAsync(clubsController.registerClub));

router.get("/", catchAsync(clubsController.listPublicClubs));

router.get("/:clubId/media", catchAsync(clubsController.listClubMedia));
router.post(
  "/:clubId/media",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.createClubMedia),
);
router.delete(
  "/:clubId/media/:mediaId",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.deleteClubMedia),
);

router.patch(
  "/:clubId/profile",
  clubRoleMiddleware(["president", "vice_president"]),
  catchAsync(clubsController.updateClubProfile),
);
router.get(
  "/:clubId/manage",
  clubRoleMiddleware(),
  catchAsync(clubsController.getClubManageView),
);

router.post("/:clubId/join", catchAsync(clubsController.joinClub));
router.get(
  "/:clubId/requests",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.listMembershipRequests),
);
router.patch(
  "/:clubId/requests/:requestId",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.respondMembershipRequest),
);
router.post(
  "/:clubId/invite",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.inviteMember),
);
router.get(
  "/:clubId/members",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.listMembers),
);
router.patch(
  "/:clubId/members/:userId/role",
  clubRoleMiddleware(),
  catchAsync(clubsController.updateMemberRole),
);
router.delete(
  "/:clubId/members/:userId",
  clubRoleMiddleware(["president", "vice_president", "secretary"]),
  catchAsync(clubsController.removeMember),
);

router.get(
  "/:clubId/roles",
  clubRoleMiddleware(),
  catchAsync(clubsController.listRoles),
);
router.post(
  "/:clubId/roles",
  clubRoleMiddleware(),
  catchAsync(clubsController.createRole),
);
router.patch(
  "/:clubId/roles/:roleId",
  clubRoleMiddleware(),
  catchAsync(clubsController.updateRole),
);
router.delete(
  "/:clubId/roles/:roleId",
  clubRoleMiddleware(),
  catchAsync(clubsController.deleteRole),
);

router.get("/:clubId", catchAsync(clubsController.getPublicClubProfile));

// mount posts and events routes under clubs
const postsRoutes = require("../posts/posts.routes");
const eventsRoutes = require("../events/events.routes");
const notificationsRoutes = require("../notifications/notifications.routes");
const projectsRoutes = require("../projects/projects.routes");
const { clubSurveysRouter } = require("../surveys/surveys.routes");

router.use("/:clubId/posts", postsRoutes);
router.use("/:clubId/events", eventsRoutes);
router.use("/:clubId/notifications", notificationsRoutes);
router.use("/:clubId/projects", projectsRoutes);
router.use("/:clubId/surveys", clubSurveysRouter);

module.exports = router;
