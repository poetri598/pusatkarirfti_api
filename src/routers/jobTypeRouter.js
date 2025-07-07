import express from "express";
import { CreateJobType, GetJobTypeAll, GetJobTypeById, UpdateJobTypeById, DeleteJobTypeById, SearchFilterSortJobTypes } from "../controllers/jobTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/job-types", uploadNoneMiddleware, CreateJobType);

// READ
router.get("/job-types", GetJobTypeAll);
router.get("/job-types/search", SearchFilterSortJobTypes);
router.get("/job-types/:job_type_id", GetJobTypeById);

// UPDATE
router.put("/job-types/:job_type_id", uploadNoneMiddleware, UpdateJobTypeById);

// DELETE
router.delete("/job-types/:job_type_id", DeleteJobTypeById);

export default router;
