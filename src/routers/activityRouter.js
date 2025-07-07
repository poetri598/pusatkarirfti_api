import express from "express";
import { CreateActivity, GetActivityAll, GetActivityById, UpdateActivityById, DeleteActivityById, SearchFilterSortActivities } from "../controllers/activityController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/activities", uploadNoneMiddleware, CreateActivity);

// READ
router.get("/activities", GetActivityAll);
router.get("/activities/search", SearchFilterSortActivities);
router.get("/activities/:activity_id", GetActivityById);

// UPDATE
router.put("/activities/:activity_id", uploadNoneMiddleware, UpdateActivityById);

// DELETE
router.delete("/activities/:activity_id", DeleteActivityById);

export default router;
