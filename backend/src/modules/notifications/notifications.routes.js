const router = require("express").Router();
const catchAsync = require("../../utils/catchAsync");
const authMiddleware = require("../../middleware/auth");
const notificationsController = require("./notifications.controller");

router.get(
  "/",
  authMiddleware,
  catchAsync(notificationsController.getMyNotifications),
);
router.patch(
  "/:id/read",
  authMiddleware,
  catchAsync(notificationsController.markAsRead),
);
router.patch(
  "/read-all",
  authMiddleware,
  catchAsync(notificationsController.markAllAsRead),
);

module.exports = router;
