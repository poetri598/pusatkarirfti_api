// src/routers/userSkillRouter.js
import express from "express";
import { CreateUserSkill, GetAllUserSkills, GetUserSkillById, UpdateUserSkillById, DeleteUserSkillById } from "../controllers/userSkillController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/user-skills", uploadNoneMiddleware, CreateUserSkill);

// === READ ===
router.get("/user-skills", uploadNoneMiddleware, GetAllUserSkills);
router.get("/user-skills/:user_skill_id", uploadNoneMiddleware, GetUserSkillById);

// === UPDATE ===
router.put("/user-skills/:user_skill_id", uploadNoneMiddleware, UpdateUserSkillById);

// === DELETE ===
router.delete("/user-skills/:user_skill_id", uploadNoneMiddleware, DeleteUserSkillById);

export default router;
