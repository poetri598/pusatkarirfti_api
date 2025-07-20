import express from "express";
import {
  CreateNews,
  GetNewsAll,
  GetNewsById,
  GetNewsBySlug,
  GetThreeLatestNews,
  GetNewsAllExceptSlug,
  GetOneMostPopularNews,
  IncrementViewBySlug,
  UpdateNewsById,
  DeleteNewsById,
  GetNewsAllByTypeNameKegiatanPusatKarirFTI,
  GetNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug,
  SearchFilterSortNews,
  SearchFilterSortNewsActive,
  GetSummary,
} from "../controllers/newsController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/news", uploadImageMiddleware("news_img"), CreateNews);

// READ
router.get("/news", GetNewsAll);
router.get("/news/summary", GetSummary);
router.get("/news/three-latest", GetThreeLatestNews);
router.get("/news/one-most-popular", GetOneMostPopularNews);
router.get("/news/except/:news_slug", GetNewsAllExceptSlug);
router.get("/news/kegiatan-pusat-karir-fti", GetNewsAllByTypeNameKegiatanPusatKarirFTI);
router.get("/news/kegiatan-pusat-karir-fti/except/:news_slug", GetNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug);
router.get("/news/slug/:news_slug", GetNewsBySlug);
router.get("/news/search-active", SearchFilterSortNewsActive);
router.get("/news/search", SearchFilterSortNews);
router.get("/news/:news_id", GetNewsById);

// UPDATE
router.put("/news/:news_id", uploadImageMiddleware("news_img"), UpdateNewsById);
router.patch("/news/view/:news_slug", IncrementViewBySlug);

// DELETE
router.delete("/news/:news_id", DeleteNewsById);

export default router;
