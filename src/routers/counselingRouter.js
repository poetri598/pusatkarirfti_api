import express from "express";
import { CreateCounseling, GetCounselingAll, GetCounselingById, UpdateCounselingById, DeleteCounselingById, GetCounselingAllByUserId, SearchFilterSortCounselings } from "../controllers/counselingController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
import { searchFilterSortCounselings } from "../models/counselingModel.js";

const router = express.Router();

// CREATE
router.post("/counselings", uploadNoneMiddleware, CreateCounseling);

// READ
router.get("/counselings", GetCounselingAll);
router.get("/counselings/user/:user_id", GetCounselingAllByUserId);
router.get("/counselings/search", searchFilterSortCounselings);
router.get("/counselings/:counseling_id", GetCounselingById);

// UPDATE
router.put("/counselings/:counseling_id", uploadNoneMiddleware, UpdateCounselingById);

// DELETE
router.delete("/counselings/:counseling_id", DeleteCounselingById);

export default router;
