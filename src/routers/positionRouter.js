import express from "express";
import { CreatePosition, GetPositionAll, GetPositionById, UpdatePositionById, DeletePositionById, SearchFilterSortPositions } from "../controllers/positionController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/positions", uploadNoneMiddleware, CreatePosition);

// READ
router.get("/positions", GetPositionAll);
router.get("/positions/search", SearchFilterSortPositions);
router.get("/positions/:position_id", GetPositionById);

// UPDATE
router.put("/positions/:position_id", uploadNoneMiddleware, UpdatePositionById);

// DELETE
router.delete("/positions/:position_id", DeletePositionById);

export default router;
