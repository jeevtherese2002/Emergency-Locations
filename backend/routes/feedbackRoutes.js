import express from "express";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";
import { createFeedback, getFeedbackForLocation, getLocationFeedbackSummary, } from "../controllers/feedbackController.js";

const FeedbackRouter = express.Router();

FeedbackRouter.post("/", verifyToken, checkRole("user"), createFeedback);

FeedbackRouter.get("/location/:locationId", verifyToken, checkRole("user"), getFeedbackForLocation);

FeedbackRouter.get("/locations/summary", verifyToken, checkRole("user"), getLocationFeedbackSummary);

export default FeedbackRouter;