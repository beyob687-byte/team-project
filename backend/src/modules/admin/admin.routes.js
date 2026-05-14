const router = require("express").Router();
const catchAsync = require("../../utils/catchAsync");
const adminController = require("./admin.controller");

router.get("/dashboard", catchAsync(adminController.getDashboard));
router.get(
  "/reports/club-health",
  catchAsync(adminController.getClubHealthReport),
);
router.get(
  "/reports/engagement",
  catchAsync(adminController.getEngagementReport),
);

router.get(
  "/clubs/registrations",
  catchAsync(adminController.listRegistrations),
);
router.patch(
  "/clubs/:clubId/registration",
  catchAsync(adminController.resolveRegistrationDecision),
);
router.patch(
  "/clubs/:clubId/status",
  catchAsync(adminController.updateClubStatus),
);
router.delete("/clubs/:clubId", catchAsync(adminController.deleteClub));
router.get("/clubs/:clubId", catchAsync(adminController.getClubDetails));
router.get("/clubs", catchAsync(adminController.listClubs));

router.get("/users/:userId", catchAsync(adminController.getUserDetails));
router.patch(
  "/users/:userId/status",
  catchAsync(adminController.updateUserStatus),
);
router.get("/users", catchAsync(adminController.listUsers));

module.exports = router;
