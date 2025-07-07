import express from "express";
import { CreateInternshipType, GetInternshipTypeAll, GetInternshipTypeById, UpdateInternshipTypeById, DeleteInternshipTypeById, SearchFilterSortInternshipTypes } from "../controllers/internshipTypeController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/internship-types", uploadNoneMiddleware, CreateInternshipType);

// READ
router.get("/internship-types", GetInternshipTypeAll);
router.get("/internship-types/search", SearchFilterSortInternshipTypes);
router.get("/internship-types/:internship_type_id", GetInternshipTypeById);

// UPDATE
router.put("/internship-types/:internship_type_id", uploadNoneMiddleware, UpdateInternshipTypeById);

// DELETE
router.delete("/internship-types/:internship_type_id", DeleteInternshipTypeById);

export default router;
