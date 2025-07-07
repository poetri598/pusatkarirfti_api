import express from "express";
import { CreateCounselingType, GetCounselingTypeAll, GetCounselingTypeById, UpdateCounselingTypeById, DeleteCounselingTypeById, SearchFilterSortCounselingTypes } from "../controllers/counselingTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/counseling-types", uploadNoneMiddleware, CreateCounselingType);

// READ
router.get("/counseling-types", GetCounselingTypeAll);
router.get("/counseling-types/search", SearchFilterSortCounselingTypes);
router.get("/counseling-types/:counseling_type_id", GetCounselingTypeById);

// UPDATE
router.put("/counseling-types/:counseling_type_id", uploadNoneMiddleware, UpdateCounselingTypeById);

// DELETE
router.delete("/counseling-types/:counseling_type_id", DeleteCounselingTypeById);

export default router;
