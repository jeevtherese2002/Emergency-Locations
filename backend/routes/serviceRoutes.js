import express from "express";
import { getServices, addService } from "../controllers/serviceController.js";
import { verifyToken, checkRole } from '../middleware/verifyToken.js';

const ServiceRouter = express.Router();


ServiceRouter.get("/", verifyToken, checkRole("admin"), getServices);
ServiceRouter.post("/", verifyToken, checkRole("admin"), addService);

export default ServiceRouter;
