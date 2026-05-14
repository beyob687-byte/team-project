const router = require("express").Router({ mergeParams: true });
const postsController = require("./posts.controller");
const catchAsync = require("../../utils/catchAsync");
const { postImagesUpload } = require("../../middleware/upload");
const clubRoleMiddleware = require("../../middleware/clubRole");
const authMiddleware = require("../../middleware/auth");
const pollsRoutes = require("../polls/polls.routes");

// Protected routes under /api/v1/clubs/:clubId/posts
router.post(
  "/",
  authMiddleware,
  clubRoleMiddleware(),
  postImagesUpload,
  catchAsync(postsController.createPost),
);

router.get("/", authMiddleware, catchAsync(postsController.getClubPosts));
router.get("/:postId", authMiddleware, catchAsync(postsController.getPost));
router.patch(
  "/:postId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(postsController.updatePost),
);
router.delete(
  "/:postId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(postsController.deletePost),
);

// comments
router.post(
  "/:postId/comments",
  authMiddleware,
  catchAsync(postsController.createComment),
);
router.get(
  "/:postId/comments",
  authMiddleware,
  catchAsync(postsController.listComments),
);
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  clubRoleMiddleware(),
  catchAsync(postsController.deleteComment),
);

// poll vote + results
router.use("/", authMiddleware, pollsRoutes);

module.exports = router;
