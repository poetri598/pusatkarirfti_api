import express from "express";
import {
  CreateUserAchievements,
  GetUserAchievementsAll,
  GetUserAchievementById,
  UpdateUserAchievementById,
  DeleteUserAchievementById,
  GetUserAchievementsByUsername,
  DeleteUserAchievementsByUsername,
  UpdateUserAchievementsByUsername,
} from "../controllers/userAchievementController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/user-achievements", uploadNoneMiddleware, CreateUserAchievements);

// READ
router.get("/user-achievements", GetUserAchievementsAll);
router.get("/user-achievements/username/:username", GetUserAchievementsByUsername);
router.get("/user-achievements/:user_achievement_id", GetUserAchievementById);

// UPDATE
router.put("/user-achievements/:user_achievement_id", uploadNoneMiddleware, UpdateUserAchievementById);
router.put("/user-achievements/username/:username", uploadNoneMiddleware, UpdateUserAchievementsByUsername);

// DELETE
router.delete("/user-achievements/:user_achievement_id", DeleteUserAchievementById);
router.delete("/user-achievements/username/:username", DeleteUserAchievementsByUsername);

export default router;
