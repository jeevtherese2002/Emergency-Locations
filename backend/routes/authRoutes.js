import express from "express";
import { registerUser, loginUser, loginAdmin } from "../controllers/authController.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/login", loginUser);
AuthRouter.post("/admin/login", loginAdmin);

export default AuthRouter;