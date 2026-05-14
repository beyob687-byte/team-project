const router = require("express").Router({ mergeParams: true });
const catchAsync = require("../../utils/catchAsync");
const authMiddleware = require("../../middleware/auth");
const clubRoleMiddleware = require("../../middleware/clubRole");
const { upload } = require("../../middleware/upload");
const projectsController = require("./projects.controller");

router.post(
  "/",
  authMiddleware,
  clubRoleMiddleware("manage_projects"),
  upload.single("cover_image"),
  catchAsync(projectsController.createProject),
);

router.patch(
  "/:projectId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(projectsController.updateProject),
);

router.delete(
  "/:projectId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(projectsController.deleteProject),
);

router.get("/", authMiddleware, catchAsync(projectsController.getClubProjects));
router.get(
  "/:projectId",
  authMiddleware,
  catchAsync(projectsController.getProject),
);

router.post(
  "/:projectId/like",
  authMiddleware,
  catchAsync(projectsController.toggleLike),
);

router.post(
  "/:projectId/media",
  authMiddleware,
  clubRoleMiddleware(),
  upload.single("file"),
  catchAsync(projectsController.addProjectMedia),
);

router.delete(
  "/:projectId/media/:mediaId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(projectsController.deleteProjectMedia),
);

module.exports = router;
