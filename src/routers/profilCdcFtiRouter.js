import express from "express";
import { CreateProfilCdcFti, GetProfilCdcFtiAll, GetProfilCdcFtiById, UpdateProfilCdcFtiById, DeleteProfilCdcFtiById, SearchFilterSortProfilCdcFti } from "../controllers/profilCdcFtiController.js";

import { uploadImagesMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

const imageFields = ["profil_cdc_fti_img", "profil_cdc_fti_vision_img", "profil_cdc_fti_mission_img", "profil_cdc_fti_goal_img", "profil_cdc_fti_benefit_img"];

// CREATE
router.post("/profil-cdc-fti", uploadImagesMiddleware(imageFields), CreateProfilCdcFti);

// READ
router.get("/profil-cdc-fti", GetProfilCdcFtiAll);
router.get("/profil-cdc-fti/search", SearchFilterSortProfilCdcFti);
router.get("/profil-cdc-fti/:profil_cdc_fti_id", GetProfilCdcFtiById);

// UPDATE
router.put("/profil-cdc-fti/:profil_cdc_fti_id", uploadImagesMiddleware(imageFields), UpdateProfilCdcFtiById);

// DELETE
router.delete("/profil-cdc-fti/:profil_cdc_fti_id", DeleteProfilCdcFtiById);

export default router;
