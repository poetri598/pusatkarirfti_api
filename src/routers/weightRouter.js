import express from "express";
import { CreateWeight, GetWeightAll, GetWeightById, UpdateWeightById, DeleteWeightById, SearchFilterSortWeights } from "../controllers/weightController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/weights", uploadNoneMiddleware, CreateWeight);

// READ
router.get("/weights", GetWeightAll);
router.get("/weights/search", SearchFilterSortWeights);
router.get("/weights/:weight_id", GetWeightById);

// UPDATE
router.put("/weights/:weight_id", uploadNoneMiddleware, UpdateWeightById);

// DELETE
router.delete("/weights/:weight_id", DeleteWeightById);

export default router;
