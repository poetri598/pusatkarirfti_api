import express from "express";
import {
  CreateUserEducations,
  GetUserEducationsAll,
  GetUserEducationById,
  UpdateUserEducationById,
  DeleteUserEducationById,
  GetUserEducationsByUsername,
  DeleteUserEducationsByUsername,
  UpdateUserEducationsByUsername,
} from "../controllers/userEducationController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/user-educations", uploadNoneMiddleware, CreateUserEducations);

// READ
router.get("/user-educations", GetUserEducationsAll);
router.get("/user-educations/username/:username", GetUserEducationsByUsername);
router.get("/user-educations/:user_education_id", GetUserEducationById);

// UPDATE
router.put("/user-educations/:user_education_id", uploadNoneMiddleware, UpdateUserEducationById);
router.put("/user-educations/username/:username", uploadNoneMiddleware, UpdateUserEducationsByUsername);

// DELETE
router.delete("/user-educations/:user_education_id", DeleteUserEducationById);
router.delete("/user-educations/username/:username", DeleteUserEducationsByUsername);

export default router;
