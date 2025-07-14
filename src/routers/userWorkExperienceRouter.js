// src/routers/userWorkExperienceRouter.js
import express from "express";
import { CreateUserWorkExperience, GetAllUserWorkExperiences, GetUserWorkExperienceById, UpdateUserWorkExperienceById, DeleteUserWorkExperienceById } from "../controllers/userWorkExperienceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/user-work-experiences", uploadNoneMiddleware, CreateUserWorkExperience);

// === READ ===
router.get("/user-work-experiences", uploadNoneMiddleware, GetAllUserWorkExperiences);
router.get("/user-work-experiences/:user_work_experience_id", uploadNoneMiddleware, GetUserWorkExperienceById);

// === UPDATE ===
router.put("/user-work-experiences/:user_work_experience_id", uploadNoneMiddleware, UpdateUserWorkExperienceById);

// === DELETE ===
router.delete("/user-work-experiences/:user_work_experience_id", uploadNoneMiddleware, DeleteUserWorkExperienceById);

export default router;
