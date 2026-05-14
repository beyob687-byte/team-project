const router = require("express").Router();
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");

/*
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newstudent@aau.edu.et","password":"StrongPass1","first_name":"New","last_name":"Student"}'

curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"abebe.kebede@aau.edu.et","password":"Test1234"}'

curl -X POST http://localhost:4000/api/v1/auth/refresh --cookie "refreshToken=..."

curl http://localhost:4000/api/v1/auth/me --cookie "accessToken=..."
*/

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
