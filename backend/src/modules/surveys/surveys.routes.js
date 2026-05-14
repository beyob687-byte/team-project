const express = require("express");
const catchAsync = require("../../utils/catchAsync");
const authMiddleware = require("../../middleware/auth");
const clubRoleMiddleware = require("../../middleware/clubRole");
const surveyTargetMiddleware = require("../../middleware/surveyTarget");
const surveysController = require("./surveys.controller");

const clubSurveysRouter = express.Router({ mergeParams: true });
const respondentSurveysRouter = express.Router({ mergeParams: true });

clubSurveysRouter.post(
  "/",
  authMiddleware,
  clubRoleMiddleware("create_surveys"),
  catchAsync(surveysController.createSurvey),
);

clubSurveysRouter.patch(
  "/:surveyId",
  authMiddleware,
  clubRoleMiddleware("create_surveys"),
  catchAsync(surveysController.updateSurvey),
);

clubSurveysRouter.patch(
  "/:surveyId/status",
  authMiddleware,
  clubRoleMiddleware("create_surveys"),
  catchAsync(surveysController.updateSurveyStatus),
);

clubSurveysRouter.get(
  "/",
  authMiddleware,
  clubRoleMiddleware("create_surveys"),
  catchAsync(surveysController.listClubSurveys),
);

clubSurveysRouter.get(
  "/:surveyId/responses",
  authMiddleware,
  clubRoleMiddleware("view_survey_responses"),
  catchAsync(surveysController.getSurveyResponses),
);

respondentSurveysRouter.get(
  "/:surveyId",
  authMiddleware,
  surveyTargetMiddleware(),
  catchAsync(surveysController.getSurveyForRespondent),
);

respondentSurveysRouter.post(
  "/:surveyId/responses",
  authMiddleware,
  surveyTargetMiddleware(),
  catchAsync(surveysController.submitSurveyResponse),
);

module.exports = {
  clubSurveysRouter,
  respondentSurveysRouter,
};
