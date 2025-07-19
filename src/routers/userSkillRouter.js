// src/routes/userSkillRoute.js
import express from "express";
import { CreateUserSkills, GetUserSkillsAll, GetUserSkillsByUsername, GetUserSkillById, UpdateUserSkillById, UpdateUserSkillsByUsername, DeleteUserSkillById, DeleteUserSkillsByUsername } from "../controllers/userSkillController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/user-skills", uploadNoneMiddleware, CreateUserSkills);

// READ
router.get("/user-skills", GetUserSkillsAll);
router.get("/user-skills/username/:username", GetUserSkillsByUsername);
router.get("/user-skills/:user_skill_id", GetUserSkillById);

// UPDATE
router.put("/user-skills/:user_skill_id", uploadNoneMiddleware, UpdateUserSkillById);
router.put("/user-skills/username/:username", uploadNoneMiddleware, UpdateUserSkillsByUsername);

// DELETE
router.delete("/user-skills/:user_skill_id", DeleteUserSkillById);
router.delete("/user-skills/username/:username", DeleteUserSkillsByUsername);

export default router;
