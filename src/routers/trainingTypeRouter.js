import express from "express";
import { CreateTrainingType, GetTrainingTypeAll, GetTrainingTypeById, UpdateTrainingTypeById, DeleteTrainingTypeById, SearchFilterSortTrainingTypes } from "../controllers/trainingTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/training-types", uploadNoneMiddleware, CreateTrainingType);

// READ
router.get("/training-types", GetTrainingTypeAll);
router.get("/training-types/search", SearchFilterSortTrainingTypes);
router.get("/training-types/:training_type_id", GetTrainingTypeById);

// UPDATE
router.put("/training-types/:training_type_id", uploadNoneMiddleware, UpdateTrainingTypeById);

// DELETE
router.delete("/training-types/:training_type_id", DeleteTrainingTypeById);

export default router;
