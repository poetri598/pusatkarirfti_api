import express from "express";
import { CreateCountry, GetCountryAll, GetCountryById, UpdateCountryById, DeleteCountryById, SearchFilterSortCountries } from "../controllers/countryController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/countries", uploadNoneMiddleware, CreateCountry);

// READ
router.get("/countries", GetCountryAll);
router.get("/countries/search", SearchFilterSortCountries);
router.get("/countries/:country_id", GetCountryById);

// UPDATE
router.put("/countries/:country_id", uploadNoneMiddleware, UpdateCountryById);

// DELETE
router.delete("/countries/:country_id", DeleteCountryById);

export default router;
