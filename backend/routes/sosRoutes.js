import express from "express";
import { getSOSContacts, addSOSContact, updateSOSContact, deleteSOSContact, } from "../controllers/sosController.js";
import { sendSosToContacts } from "../controllers/sosContactController.js";
import { sendSosToNearbyServices } from "../controllers/sosServiceController.js";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";
import { sendSosToNearbyUsers } from "../controllers/sosNearbyUsersController.js";

const SosRouter = express.Router();

SosRouter.get("/sos-contacts", verifyToken, checkRole("user"), getSOSContacts);
SosRouter.post("/sos-contacts", verifyToken, checkRole("user"), addSOSContact);
SosRouter.patch("/sos-contacts/:contactId", verifyToken, checkRole("user"), updateSOSContact);
SosRouter.delete("/sos-contacts/:contactId", verifyToken, checkRole("user"), deleteSOSContact);

SosRouter.post("/contacts", verifyToken, checkRole("user"), sendSosToContacts);
SosRouter.post('/services', verifyToken, checkRole('user'), sendSosToNearbyServices);
SosRouter.post('/nearby-users', verifyToken, checkRole('user'), sendSosToNearbyUsers);

export default SosRouter;