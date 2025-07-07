import express from "express";
import { CreateNewsType, GetNewsTypeAll, GetNewsTypeById, UpdateNewsTypeById, DeleteNewsTypeById, SearchFilterSortNewsTypes } from "../controllers/newsTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/news-types", uploadNoneMiddleware, CreateNewsType);

// READ
router.get("/news-types", GetNewsTypeAll);
router.get("/news-types/search", SearchFilterSortNewsTypes);
router.get("/news-types/:news_type_id", GetNewsTypeById);

// UPDATE
router.put("/news-types/:news_type_id", uploadNoneMiddleware, UpdateNewsTypeById);

// DELETE
router.delete("/news-types/:news_type_id", DeleteNewsTypeById);

export default router;
