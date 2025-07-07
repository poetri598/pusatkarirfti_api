import express from "express";
import { CreateExpoType, GetExpoTypeAll, GetExpoTypeById, UpdateExpoTypeById, DeleteExpoTypeById, SearchFilterSortExpoTypes } from "../controllers/expoTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/expo-types", uploadNoneMiddleware, CreateExpoType);

// READ
router.get("/expo-types", GetExpoTypeAll);
router.get("/expo-types/search", SearchFilterSortExpoTypes);
router.get("/expo-types/:expo_type_id", GetExpoTypeById);

// UPDATE
router.put("/expo-types/:expo_type_id", uploadNoneMiddleware, UpdateExpoTypeById);

// DELETE
router.delete("/expo-types/:expo_type_id", DeleteExpoTypeById);

export default router;
