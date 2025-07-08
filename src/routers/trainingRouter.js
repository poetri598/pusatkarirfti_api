import express from "express";
import {
  CreateTraining,
  GetTrainingAll,
  GetTrainingById,
  UpdateTrainingById,
  DeleteTrainingById,
  GetTrainingBySlug,
  GetThreeLatestTraining,
  GetTrainingAllExceptSlug,
  IncrementViewBySlug,
  SearchFilterSortTrainings,
  SearchFilterSortTrainingsActive,
} from "../controllers/trainingController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/trainings", uploadImageMiddleware("training_img"), CreateTraining);

// READ
router.get("/trainings", GetTrainingAll);
router.get("/trainings/three-latest", GetThreeLatestTraining);
router.get("/trainings/except/:training_slug", GetTrainingAllExceptSlug);
router.get("/trainings/slug/:training_slug", GetTrainingBySlug);
router.get("/trainings/search-active", SearchFilterSortTrainingsActive);
router.get("/trainings/search", SearchFilterSortTrainings);
router.get("/trainings/:training_id", GetTrainingById);

// UPDATE
router.put("/trainings/:training_id", uploadImageMiddleware("training_img"), UpdateTrainingById);
router.patch("/trainings/view/:training_slug", IncrementViewBySlug);

// DELETE
router.delete("/trainings/:training_id", DeleteTrainingById);

export default router;
