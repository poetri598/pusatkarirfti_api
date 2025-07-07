import express from "express";
import { CreateIpk, GetIpkAll, GetIpkById, UpdateIpkById, DeleteIpkById, SearchFilterSortIpks } from "../controllers/ipkController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/ipks", uploadNoneMiddleware, CreateIpk);

// READ
router.get("/ipks", GetIpkAll);
router.get("/ipks/search", SearchFilterSortIpks);
router.get("/ipks/:ipk_id", GetIpkById);

// UPDATE
router.put("/ipks/:ipk_id", uploadNoneMiddleware, UpdateIpkById);

// DELETE
router.delete("/ipks/:ipk_id", DeleteIpkById);

export default router;
