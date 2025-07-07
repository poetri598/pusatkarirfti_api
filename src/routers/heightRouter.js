import express from "express";
import { CreateHeight, GetHeightAll, GetHeightById, UpdateHeightById, DeleteHeightById, SearchFilterSortHeights } from "../controllers/heightController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/heights", uploadNoneMiddleware, CreateHeight);

// READ
router.get("/heights", GetHeightAll);
router.get("/heights/search", SearchFilterSortHeights);
router.get("/heights/:height_id", GetHeightById);

// UPDATE
router.put("/heights/:height_id", uploadNoneMiddleware, UpdateHeightById);

// DELETE
router.delete("/heights/:height_id", DeleteHeightById);

export default router;
