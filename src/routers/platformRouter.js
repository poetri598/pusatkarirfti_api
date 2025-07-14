import express from "express";
import { CreatePlatform, GetPlatformAll, GetPlatformById, UpdatePlatformById, DeletePlatformById, SearchFilterSortPlatforms } from "../controllers/platformController.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/platforms", uploadImageMiddleware("platform_img"), CreatePlatform);

// READ
router.get("/platforms", GetPlatformAll);
router.get("/platforms/search", SearchFilterSortPlatforms);
router.get("/platforms/:platform_id", GetPlatformById);

// UPDATE
router.put("/platforms/:platform_id", uploadImageMiddleware("platform_img"), UpdatePlatformById);

// DELETE
router.delete("/platforms/:platform_id", DeletePlatformById);

export default router;
