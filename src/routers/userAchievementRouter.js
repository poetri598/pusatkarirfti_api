import express from "express";
import { CreateUserAchievement, GetAllUserAchievements, GetUserAchievementById, UpdateUserAchievementById, DeleteUserAchievementById } from "../controllers/userAchievementController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/user-achievements", uploadNoneMiddleware, CreateUserAchievement);

// === READ ===
router.get("/user-achievements", GetAllUserAchievements);
router.get("/user-achievements/:user_achievement_id", GetUserAchievementById);

// === UPDATE ===
router.put("/user-achievements/:user_achievement_id", uploadNoneMiddleware, UpdateUserAchievementById);

// === DELETE ===
router.delete("/user-achievements/:user_achievement_id", DeleteUserAchievementById);

export default router;
