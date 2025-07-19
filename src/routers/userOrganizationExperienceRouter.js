import express from "express";
import {
  CreateUserOrganizationExperiences,
  GetUserOrganizationExperiencesAll,
  GetUserOrganizationExperienceById,
  UpdateUserOrganizationExperienceById,
  DeleteUserOrganizationExperienceById,
  GetUserOrganizationExperiencesByUsername,
  DeleteUserOrganizationExperiencesByUsername,
  UpdateUserOrganizationExperiencesByUsername,
} from "../controllers/userOrganizationExperienceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/organization-experiences", uploadNoneMiddleware, CreateUserOrganizationExperiences);

// READ
router.get("/organization-experiences", GetUserOrganizationExperiencesAll);
router.get("/organization-experiences/username/:username", GetUserOrganizationExperiencesByUsername);
router.get("/organization-experiences/:user_organization_id", GetUserOrganizationExperienceById);

// UPDATE
router.put("/organization-experiences/:user_organization_id", uploadNoneMiddleware, UpdateUserOrganizationExperienceById);
router.put("/organization-experiences/username/:username", uploadNoneMiddleware, UpdateUserOrganizationExperiencesByUsername);

// DELETE
router.delete("/organization-experiences/:user_organization_id", DeleteUserOrganizationExperienceById);
router.delete("/organization-experiences/username/:username", DeleteUserOrganizationExperiencesByUsername);

export default router;
