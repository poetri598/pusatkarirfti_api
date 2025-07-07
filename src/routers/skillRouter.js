import express from "express";
import { CreateSkill, GetSkillAll, GetSkillById, UpdateSkillById, DeleteSkillById, SearchFilterSortSkills } from "../controllers/skillController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/skills", uploadNoneMiddleware, CreateSkill);

// READ
router.get("/skills", GetSkillAll);
router.get("/skills/search", SearchFilterSortSkills);
router.get("/skills/:skill_id", GetSkillById);

// UPDATE
router.put("/skills/:skill_id", uploadNoneMiddleware, UpdateSkillById);

// DELETE
router.delete("/skills/:skill_id", uploadNoneMiddleware, DeleteSkillById);

export default router;
