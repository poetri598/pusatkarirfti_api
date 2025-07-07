import express from "express";
import { CreateMaritalStatus, GetMaritalStatusAll, GetMaritalStatusById, UpdateMaritalStatusById, DeleteMaritalStatusById, SearchFilterSortMaritalStatuses } from "../controllers/maritalStatusController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/marital-statuses", uploadNoneMiddleware, CreateMaritalStatus);

// READ
router.get("/marital-statuses", GetMaritalStatusAll);
router.get("/marital-statuses/search", SearchFilterSortMaritalStatuses);
router.get("/marital-statuses/:marital_status_id", GetMaritalStatusById);

// UPDATE
router.put("/marital-statuses/:marital_status_id", uploadNoneMiddleware, UpdateMaritalStatusById);

// DELETE
router.delete("/marital-statuses/:marital_status_id", DeleteMaritalStatusById);

export default router;
