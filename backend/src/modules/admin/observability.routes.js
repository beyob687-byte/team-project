const router = require("express").Router();
const catchAsync = require("../../utils/catchAsync");
const observabilityController = require("./observability.controller");

router.get(
  "/feature-flags",
  catchAsync(observabilityController.getFeatureFlags),
);
router.patch(
  "/feature-flags/:flagName",
  catchAsync(observabilityController.patchFeatureFlag),
);

router.get("/audit-logs", catchAsync(observabilityController.getAuditLogs));
router.get("/email-logs", catchAsync(observabilityController.getEmailLogs));
router.get(
  "/recommendation-cache",
  catchAsync(observabilityController.getRecommendationCache),
);
router.get(
  "/surveys/:surveyId/insights",
  catchAsync(observabilityController.getSurveyInsights),
);

module.exports = router;
