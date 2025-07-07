import express from "express";
import { CreateRole, GetRoleAll, GetRoleById, UpdateRoleById, DeleteRoleById, SearchFilterSortRoles } from "../controllers/roleController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// CREATE
router.post("/roles", uploadNoneMiddleware, CreateRole);

// READ
router.get("/roles", GetRoleAll);
router.get("/roles/search", SearchFilterSortRoles);
router.get("/roles/:role_id", GetRoleById);

// UPDATE
router.put("/roles/:role_id", uploadNoneMiddleware, UpdateRoleById);

// DELETE
router.delete("/roles/:role_id", DeleteRoleById);

export default router;
