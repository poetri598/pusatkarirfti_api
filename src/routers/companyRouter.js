// src/routes/companyRoutes.js
import express from "express";
import { CreateCompany, GetCompanyAll, GetCompanyById, UpdateCompanyById, DeleteCompanyById, GetCompanyAllIsPartner, SearchFilterSortCompanies } from "../controllers/companyController.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/companies", uploadImageMiddleware("company_img"), CreateCompany);

// READ
router.get("/companies", GetCompanyAll);
router.get("/companies/search", SearchFilterSortCompanies);
router.get("/companies/is-partner", GetCompanyAllIsPartner);
router.get("/companies/:company_id", GetCompanyById);

// UPDATE
router.put("/companies/:company_id", uploadImageMiddleware("company_img"), UpdateCompanyById);

// DELETE
router.delete("/companies/:company_id", DeleteCompanyById);

export default router;
