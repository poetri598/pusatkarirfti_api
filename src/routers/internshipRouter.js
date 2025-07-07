import express from "express";
import {
  CreateInternship,
  GetInternshipAll,
  GetInternshipById,
  UpdateInternshipById,
  DeleteInternshipById,
  GetInternshipBySlug,
  GetThreeLatestInternship,
  GetInternshipAllExceptSlug,
  IncrementViewBySlug,
  SearchFilterSortInternships,
} from "../controllers/internshipController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/internships", uploadImageMiddleware("internship_img"), CreateInternship);

// READ
router.get("/internships", GetInternshipAll);
router.get("/internships/three-latest", GetThreeLatestInternship);
router.get("/internships/except/:internship_slug", GetInternshipAllExceptSlug);
router.get("/internships/slug/:internship_slug", GetInternshipBySlug);
router.get("/internships/search", SearchFilterSortInternships);
router.get("/internships/:internship_id", GetInternshipById);

// UPDATE
router.put("/internships/:internship_id", uploadImageMiddleware("internship_img"), UpdateInternshipById);
router.patch("/internships/view/:internship_slug", IncrementViewBySlug);

// DELETE
router.delete("/internships/:internship_id", DeleteInternshipById);

export default router;
