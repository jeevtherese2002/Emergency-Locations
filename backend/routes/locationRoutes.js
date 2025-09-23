import express from "express";
import {
  getLocations,
  addLocation,
  toggleLocationStatus,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";
import { verifyToken, checkRole } from "../middleware/verifyToken.js";

const LocationRouter = express.Router();

// Public (user)
LocationRouter.get("/", getLocations);

// Admin-only
LocationRouter.post("/", verifyToken, checkRole("admin"), addLocation);
LocationRouter.put("/:id/toggle", verifyToken, checkRole("admin"), toggleLocationStatus);
LocationRouter.put("/:id", verifyToken, checkRole("admin"), updateLocation);
LocationRouter.delete("/:id", verifyToken, checkRole("admin"), deleteLocation);

export default LocationRouter;