import express from "express";
import { CreateSkillLevel, GetSkillLevelAll, GetSkillLevelById, UpdateSkillLevelById, DeleteSkillLevelById, SearchFilterSortSkillLevels } from "../controllers/skillLevelController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/skill-levels", uploadNoneMiddleware, CreateSkillLevel);

// READ
router.get("/skill-levels", GetSkillLevelAll);
router.get("/skill-levels/search", SearchFilterSortSkillLevels);
router.get("/skill-levels/:skill_level_id", GetSkillLevelById);

// UPDATE
router.put("/skill-levels/:skill_level_id", uploadNoneMiddleware, UpdateSkillLevelById);

// DELETE
router.delete("/skill-levels/:skill_level_id", DeleteSkillLevelById);

export default router;
