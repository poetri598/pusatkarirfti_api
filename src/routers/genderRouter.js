import express from "express";
import { CreateGender, GetGenderAll, GetGenderById, UpdateGenderById, DeleteGenderById, SearchFilterSortGenders } from "../controllers/genderController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/genders", uploadNoneMiddleware, CreateGender);

// READ
router.get("/genders", GetGenderAll);
router.get("/genders/search", SearchFilterSortGenders);
router.get("/genders/:gender_id", GetGenderById);

// UPDATE
router.put("/genders/:gender_id", uploadNoneMiddleware, UpdateGenderById);

// DELETE
router.delete("/genders/:gender_id", DeleteGenderById);

export default router;
