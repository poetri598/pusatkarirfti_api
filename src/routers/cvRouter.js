import express from "express";
import { GetUserCVByUsername } from "../controllers/cvController.js";
import { uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === READ ===
router.get("/cv/username/:user_name", uploadNoneMiddleware, GetUserCVByUsername);

export default router;
