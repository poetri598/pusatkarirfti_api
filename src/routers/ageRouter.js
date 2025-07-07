import express from "express";
import { CreateAge, GetAgeAll, GetAgeById, UpdateAgeById, DeleteAgeById, SearchFilterSortAges } from "../controllers/ageController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/ages", uploadNoneMiddleware, CreateAge);

// READ
router.get("/ages", GetAgeAll);
router.get("/ages/search", SearchFilterSortAges);
router.get("/ages/:age_id", GetAgeById);

// UPDATE
router.put("/ages/:age_id", uploadNoneMiddleware, UpdateAgeById);

// DELETE
router.delete("/ages/:age_id", DeleteAgeById);

export default router;
