import express from "express";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";
import {
  adminListFeedback,
  adminUpdateFeedbackStatus,
  adminToggleFlag,
  adminDeleteFeedback
} from "../controllers/feedbackController.js";

const AdminFeedbackRouter = express.Router();

// All admin-only
AdminFeedbackRouter.get("/", verifyToken, checkRole("admin"), adminListFeedback);
AdminFeedbackRouter.patch("/:id/status", verifyToken, checkRole("admin"), adminUpdateFeedbackStatus);
AdminFeedbackRouter.patch("/:id/flag", verifyToken, checkRole("admin"), adminToggleFlag);
AdminFeedbackRouter.delete("/:id", verifyToken, checkRole("admin"), adminDeleteFeedback);

export default AdminFeedbackRouter;