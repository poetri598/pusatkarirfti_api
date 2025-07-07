import express from "express";
import { CreateReligion, GetReligionAll, GetReligionById, UpdateReligionById, DeleteReligionById, SearchFilterSortReligions } from "../controllers/religionController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/religions", uploadNoneMiddleware, CreateReligion);

// READ
router.get("/religions", GetReligionAll);
router.get("/religions/search", SearchFilterSortReligions);
router.get("/religions/:religion_id", GetReligionById);

// UPDATE
router.put("/religions/:religion_id", uploadNoneMiddleware, UpdateReligionById);

// DELETE
router.delete("/religions/:Religion_id", DeleteReligionById);

export default router;
