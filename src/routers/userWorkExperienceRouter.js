import express from "express";
import {
  CreateUserWorkExperiences,
  GetUserWorkExperiencesAll,
  GetUserWorkExperienceById,
  UpdateUserWorkExperienceById,
  DeleteUserWorkExperienceById,
  GetUserWorkExperiencesByUsername,
  DeleteUserWorkExperiencesByUsername,
  UpdateUserWorkExperiencesByUsername,
} from "../controllers/userWorkExperienceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/work-experiences", uploadNoneMiddleware, CreateUserWorkExperiences);

// READ
router.get("/work-experiences", GetUserWorkExperiencesAll);
router.get("/work-experiences/username/:username", GetUserWorkExperiencesByUsername);
router.get("/work-experiences/:user_work_experience_id", GetUserWorkExperienceById);

// UPDATE
router.put("/work-experiences/:user_work_experience_id", uploadNoneMiddleware, UpdateUserWorkExperienceById);
router.put("/work-experiences/username/:username", uploadNoneMiddleware, UpdateUserWorkExperiencesByUsername); // ✅ Tambahan

// DELETE
router.delete("/work-experiences/:user_work_experience_id", DeleteUserWorkExperienceById);
router.delete("/work-experiences/username/:username", DeleteUserWorkExperiencesByUsername);

export default router;
