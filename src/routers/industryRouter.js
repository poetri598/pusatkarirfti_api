import express from "express";
import { CreateIndustry, GetIndustryAll, GetIndustryById, UpdateIndustryById, DeleteIndustryById, SearchFilterSortIndustries } from "../controllers/industryController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/industries", uploadNoneMiddleware, CreateIndustry);

// READ
router.get("/industries", GetIndustryAll);
router.get("/industries/search", SearchFilterSortIndustries);
router.get("/industries/:industry_id", GetIndustryById);

// UPDATE
router.put("/industries/:industry_id", uploadNoneMiddleware, UpdateIndustryById);

// DELETE
router.delete("/industries/:industry_id", DeleteIndustryById);

export default router;
