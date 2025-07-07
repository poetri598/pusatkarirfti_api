import express from "express";
import { CreateEducation, GetEducationAll, GetEducationById, UpdateEducationById, DeleteEducationById, SearchFilterSortEducations } from "../controllers/educationController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/educations", uploadNoneMiddleware, CreateEducation);

// READ
router.get("/educations", GetEducationAll);
router.get("/educations/search", SearchFilterSortEducations);
router.get("/educations/:education_id", GetEducationById);

// UPDATE
router.put("/educations/:education_id", uploadNoneMiddleware, UpdateEducationById);

// DELETE
router.delete("/educations/:education_id", DeleteEducationById);

export default router;
