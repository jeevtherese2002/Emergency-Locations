import express from "express";
import { getLocations, addLocation, toggleLocationStatus } from "../controllers/locationController.js";
import { verifyToken, checkRole } from '../middleware/verifyToken.js';

const LocationRouter = express.Router();

// Public (user)
LocationRouter.get("/", getLocations);
LocationRouter.post("/", verifyToken, checkRole("admin"), addLocation);
LocationRouter.put("/:id/toggle", verifyToken, checkRole("admin"), toggleLocationStatus);


export default LocationRouter;
