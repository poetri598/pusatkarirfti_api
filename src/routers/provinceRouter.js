import express from "express";
import { CreateProvince, GetProvinceAll, GetProvinceById, UpdateProvinceById, DeleteProvinceById, SearchFilterSortProvinces } from "../controllers/provinceController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/provinces", uploadNoneMiddleware, CreateProvince);

// READ
router.get("/provinces", GetProvinceAll);
router.get("/provinces/search", SearchFilterSortProvinces);
router.get("/provinces/:province_id", GetProvinceById);

// UPDATE
router.put("/provinces/:province_id", uploadNoneMiddleware, UpdateProvinceById);

// DELETE
router.delete("/provinces/:province_id", DeleteProvinceById);

export default router;
