const router = require("express").Router({ mergeParams: true });
const catchAsync = require("../../utils/catchAsync");
const pollsController = require("./polls.controller");

router.post("/:postId/vote", catchAsync(pollsController.voteOnPoll));
router.get("/:postId/poll", catchAsync(pollsController.getPollResults));

module.exports = router;
