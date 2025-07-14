import express from "express";
import {
  CreateUserOrganizationExperience,
  GetAllUserOrganizationExperiences,
  GetUserOrganizationExperienceById,
  UpdateUserOrganizationExperienceById,
  DeleteUserOrganizationExperienceById,
} from "../controllers/userOrganizationExperienceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/user-organization-experiences", uploadNoneMiddleware, CreateUserOrganizationExperience);

// === READ ===
router.get("/user-organization-experiences", GetAllUserOrganizationExperiences);
router.get("/user-organization-experiences/:id", GetUserOrganizationExperienceById);

// === UPDATE ===
router.put("/user-organization-experiences/:id", uploadNoneMiddleware, UpdateUserOrganizationExperienceById);

// === DELETE ===
router.delete("/user-organization-experiences/:id", DeleteUserOrganizationExperienceById);

export default router;
