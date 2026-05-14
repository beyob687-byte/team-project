const router = require("express").Router();
const catchAsync = require("../../utils/catchAsync");
const authMiddleware = require("../../middleware/auth");
const achievementsController = require("./achievements.controller");

router.get(
  "/achievements",
  authMiddleware,
  catchAsync(achievementsController.listDefinitions),
);
router.get(
  "/users/:userId/achievements",
  authMiddleware,
  catchAsync(achievementsController.getUserAchievements),
);
router.get(
  "/clubs/:clubId/achievements",
  authMiddleware,
  catchAsync(achievementsController.getClubAchievements),
);

module.exports = router;
