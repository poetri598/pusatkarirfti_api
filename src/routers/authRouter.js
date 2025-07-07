import express from "express";
import { Login, RefreshToken, Logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/auth/login", Login);
router.post("/auth/refresh", RefreshToken);
router.post("/auth/logout", Logout);

export default router;
