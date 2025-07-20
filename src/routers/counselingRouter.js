import express from "express";
import {
  CreateCounseling,
  GetCounselingAll,
  GetCounselingById,
  UpdateCounselingById,
  DeleteCounselingById,
  GetCounselingAllByUserId,
  UpdateCounselingIsReadById,
  UpdateCounselingStatusById,
  CountUnreadCounselings,
  CountUnapprovedCounselings,
  SearchFilterSortCounselings,
  GetSummary,
} from "../controllers/counselingController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/counselings", uploadNoneMiddleware, CreateCounseling);

// READ
router.get("/counselings", GetCounselingAll);
router.get("/counselings/summary", GetSummary);
router.get("/counselings/unapproved/count", CountUnapprovedCounselings);
router.get("/counselings/unread/count", CountUnreadCounselings);
router.get("/counselings/user/:user_id", GetCounselingAllByUserId);
router.get("/counselings/search", SearchFilterSortCounselings);
router.get("/counselings/:counseling_id", GetCounselingById);

// UPDATE
router.put("/counselings/:counseling_id", uploadNoneMiddleware, UpdateCounselingById);
router.patch("/counselings/:counseling_id/is-read", UpdateCounselingIsReadById);
router.patch("/counselings/:counseling_id/status", UpdateCounselingStatusById);

// DELETE
router.delete("/counselings/:counseling_id", DeleteCounselingById);

export default router;
