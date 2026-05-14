const router = require("express").Router({ mergeParams: true });
const catchAsync = require("../../utils/catchAsync");
const authMiddleware = require("../../middleware/auth");
const clubRoleMiddleware = require("../../middleware/clubRole");
const { eventCoverUpload } = require("../../middleware/upload");
const eventsController = require("./events.controller");

router.post(
  "/",
  authMiddleware,
  clubRoleMiddleware(),
  eventCoverUpload,
  catchAsync(eventsController.createEvent),
);

router.get("/", authMiddleware, catchAsync(eventsController.listClubEvents));
router.get("/:eventId", authMiddleware, catchAsync(eventsController.getEvent));

router.patch(
  "/:eventId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(eventsController.updateEvent),
);

router.delete(
  "/:eventId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(eventsController.deleteEvent),
);

router.post(
  "/:eventId/rsvp",
  authMiddleware,
  catchAsync(eventsController.rsvp),
);

router.delete(
  "/:eventId/rsvp",
  authMiddleware,
  catchAsync(eventsController.cancelRsvp),
);

router.post(
  "/:eventId/attend",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(eventsController.markAttendance),
);

router.get(
  "/:eventId/attendance",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(eventsController.getAttendanceReport),
);

module.exports = router;
