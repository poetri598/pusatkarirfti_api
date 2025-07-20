import express from "express";
import {
  CreateJob,
  GetJobAll,
  GetJobById,
  UpdateJobById,
  DeleteJobById,
  GetJobBySlug,
  GetThreeLatestJob,
  GetJobAllExceptSlug,
  IncrementViewBySlug,
  SearchFilterSortJobs,
  SearchFilterSortJobsActive,
  GetSummary,
} from "../controllers/jobController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/jobs", uploadImageMiddleware("job_img"), CreateJob);

// READ
router.get("/jobs", GetJobAll);
router.get("/jobs/summary", GetSummary);
router.get("/jobs/three-latest", GetThreeLatestJob);
router.get("/jobs/except/:job_slug", GetJobAllExceptSlug);
router.get("/jobs/slug/:job_slug", GetJobBySlug);
router.get("/jobs/search-active", SearchFilterSortJobsActive);
router.get("/jobs/search", SearchFilterSortJobs);
router.get("/jobs/:job_id", GetJobById);

// UPDATE
router.put("/jobs/:job_id", uploadImageMiddleware("job_img"), UpdateJobById);
router.patch("/jobs/view/:job_slug", IncrementViewBySlug);

// DELETE
router.delete("/jobs/:job_id", DeleteJobById);

export default router;
