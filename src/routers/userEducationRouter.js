import express from "express";
import { CreateUserEducation, GetAllUserEducations, GetUserEducationById, UpdateUserEducationById, DeleteUserEducationById } from "../controllers/userEducationController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/user-educations", uploadNoneMiddleware, CreateUserEducation);

// === READ ===
router.get("/user-educations", GetAllUserEducations);
router.get("/user-educations/:user_education_id", GetUserEducationById);

// === UPDATE ===
router.put("/user-educations/:user_education_id", uploadNoneMiddleware, UpdateUserEducationById);

// === DELETE ===
router.delete("/user-educations/:user_education_id", DeleteUserEducationById);

export default router;
