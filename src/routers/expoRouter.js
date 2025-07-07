import express from "express";
import { CreateExpo, GetExpoAll, GetExpoById, UpdateExpoById, DeleteExpoById, GetExpoBySlug, GetThreeLatestExpo, GetExpoAllExceptSlug, IncrementViewBySlug, SearchFilterSortExpos } from "../controllers/expoController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/expos", uploadImageMiddleware("expo_img"), CreateExpo);

// READ
router.get("/expos", GetExpoAll);
router.get("/expos/three-latest", GetThreeLatestExpo);
router.get("/expos/except/:expo_slug", GetExpoAllExceptSlug);
router.get("/expos/slug/:expo_slug", GetExpoBySlug);
router.get("/expos/search", SearchFilterSortExpos);
router.get("/expos/:expo_id", GetExpoById);

// UPDATE
router.put("/expos/:expo_id", uploadImageMiddleware("expo_img"), UpdateExpoById);
router.patch("/expos/view/:expo_slug", IncrementViewBySlug);

// DELETE
router.delete("/expos/:expo_id", DeleteExpoById);

export default router;
