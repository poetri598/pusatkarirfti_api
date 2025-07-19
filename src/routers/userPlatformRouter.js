import express from "express";
import {
  CreateUserPlatforms,
  GetUserPlatformsAll,
  GetUserPlatformById,
  UpdateUserPlatformById,
  DeleteUserPlatformById,
  GetUserPlatformsByUsername,
  DeleteUserPlatformsByUsername,
  UpdateUserPlatformsByUsername,
} from "../controllers/userPlatformController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/user-platforms", uploadNoneMiddleware, CreateUserPlatforms);

// READ
router.get("/user-platforms", GetUserPlatformsAll);
router.get("/user-platforms/username/:username", GetUserPlatformsByUsername);
router.get("/user-platforms/:user_platform_id", GetUserPlatformById);

// UPDATE
router.put("/user-platforms/:user_platform_id", uploadNoneMiddleware, UpdateUserPlatformById);
router.put("/user-platforms/username/:username", uploadNoneMiddleware, UpdateUserPlatformsByUsername);

// DELETE
router.delete("/user-platforms/:user_platform_id", DeleteUserPlatformById);
router.delete("/user-platforms/username/:username", DeleteUserPlatformsByUsername);

export default router;
