import express from "express";
import { CreateExperience, GetExperienceAll, GetExperienceById, UpdateExperienceById, DeleteExperienceById, SearchFilterSortExperiences } from "../controllers/experienceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/experiences", uploadNoneMiddleware, CreateExperience);

// READ
router.get("/experiences", GetExperienceAll);
router.get("/experiences/search", SearchFilterSortExperiences);
router.get("/experiences/:experience_id", GetExperienceById);

// UPDATE
router.put("/experiences/:experience_id", uploadNoneMiddleware, UpdateExperienceById);

// DELETE
router.delete("/experiences/:experience_id", DeleteExperienceById);

export default router;
