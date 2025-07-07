import express from "express";
import { GetStatusAll, GetStatusById, CreateStatus, UpdateStatusById, DeleteStatusById, SearchFilterSortStatuses } from "../controllers/statusController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/statuses", uploadNoneMiddleware, CreateStatus);

// READ
router.get("/statuses", GetStatusAll);
router.get("/statuses/search", SearchFilterSortStatuses);
router.get("/statuses/:status_id", GetStatusById);

// UPDATE
router.put("/statuses/:status_id", uploadNoneMiddleware, UpdateStatusById);

// DELETE
router.delete("/statuses/:status_id", DeleteStatusById);

export default router;
