const router = require("express").Router();
const usersController = require("./users.controller");
const authMiddleware = require("../../middleware/auth");

/*
curl -X PATCH http://localhost:4000/api/v1/users/<your-user-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=..." \
  -d '{"bio":"I am a new student"}'
*/

router.get("/:id", authMiddleware, usersController.getProfile);
router.patch("/:id", authMiddleware, usersController.updateProfile);
router.patch(
  "/:id/preferences",
  authMiddleware,
  usersController.updatePreferences,
);
router.delete("/:id", authMiddleware, usersController.deleteAccount);

module.exports = router;
