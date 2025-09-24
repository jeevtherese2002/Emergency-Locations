import express from "express";
import {
  getSOSContacts,
  addSOSContact,
  updateSOSContact,
  deleteSOSContact,
} from "../controllers/sosController.js";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";

const SosRouter = express.Router();

SosRouter.get("/sos-contacts", verifyToken, checkRole("user"), getSOSContacts);
SosRouter.post("/sos-contacts", verifyToken, checkRole("user"), addSOSContact);
SosRouter.patch("/sos-contacts/:contactId", verifyToken, checkRole("user"), updateSOSContact);
SosRouter.delete("/sos-contacts/:contactId", verifyToken, checkRole("user"), deleteSOSContact);

export default SosRouter;