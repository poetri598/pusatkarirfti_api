import express from "express";
import { CreateCity, GetCityAll, GetCityById, UpdateCityById, DeleteCityById, SearchFilterSortCities } from "../controllers/cityController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/cities", uploadNoneMiddleware, CreateCity);

// READ
router.get("/cities", GetCityAll);
router.get("/cities/search", SearchFilterSortCities);
router.get("/cities/:city_id", GetCityById);

// UPDATE
router.put("/cities/:city_id", uploadNoneMiddleware, UpdateCityById);

// DELETE
router.delete("/cities/:city_id", DeleteCityById);

export default router;
