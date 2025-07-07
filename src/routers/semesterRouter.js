import express from "express";
import { CreateSemester, GetSemesterAll, GetSemesterById, UpdateSemesterById, DeleteSemesterById, SearchFilterSortSemesters } from "../controllers/semesterController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/semesters", uploadNoneMiddleware, CreateSemester);

// READ
router.get("/semesters", GetSemesterAll);
router.get("/semesters/search", SearchFilterSortSemesters);
router.get("/semesters/:semester_id", GetSemesterById);

// UPDATE
router.put("/semesters/:semester_id", uploadNoneMiddleware, UpdateSemesterById);

// DELETE
router.delete("/semesters/:semester_id", DeleteSemesterById);

export default router;
