import express from "express";
import { CreateMode, GetModeAll, GetModeById, UpdateModeById, DeleteModeById, SearchFilterSortModes } from "../controllers/modeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/modes", uploadNoneMiddleware, CreateMode);

// READ
router.get("/modes", GetModeAll);
router.get("/modes/search", SearchFilterSortModes);
router.get("/modes/:mode_id", GetModeById);

// UPDATE
router.put("/modes/:mode_id", uploadNoneMiddleware, UpdateModeById);

// DELETE
router.delete("/modes/:mode_id", DeleteModeById);

export default router;
