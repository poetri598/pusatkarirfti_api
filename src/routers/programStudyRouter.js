import express from "express";
import { CreateProgramStudy, GetProgramStudyAll, GetProgramStudyById, UpdateProgramStudyById, DeleteProgramStudyById, SearchFilterSortProgramStudies } from "../controllers/programStudyController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/program-studies", uploadNoneMiddleware, CreateProgramStudy);

// READ
router.get("/program-studies", GetProgramStudyAll);
router.get("/program-studies/search", SearchFilterSortProgramStudies);
router.get("/program-studies/:program_study_id", GetProgramStudyById);

// UPDATE
router.put("/program-studies/:program_study_id", uploadNoneMiddleware, UpdateProgramStudyById);

// DELETE
router.delete("/program-studies/:program_study_id", DeleteProgramStudyById);

export default router;
