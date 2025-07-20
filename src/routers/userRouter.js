import express from "express";
import {
  CreateUser,
  GetUserAll,
  GetUserById,
  UpdateUserById,
  DeleteUserById,
  GetUserAllIsEmployed,
  GetUserByUsername,
  GetUserAllAdmin,
  UpdateUserByUsername,
  UpdateUserEmailByUsername,
  UpdateUserPasswordByUsername,
  UpdateUserProfileWithSocials,
  UpdateUserForCVByUsername,
  DeleteUserByUsername,
  SearchFilterSortUsers,
  GetSummary,
} from "../controllers/userController.js";
import { authenticate, ownerOrAdmin } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware, uploadNoneMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// === CREATE ===
router.post("/users", uploadImageMiddleware("user_img"), CreateUser);

// === READ ===
router.get("/users", GetUserAll);
router.get("/users/summary", GetSummary);
router.get("/users/employed", GetUserAllIsEmployed);
router.get("/users/admin", GetUserAllAdmin);
router.get("/users/search", SearchFilterSortUsers);
router.get("/users/username/:user_name", GetUserByUsername);
router.get("/users/:user_id", GetUserById);

// === UPDATE ===
router.put("/users/:user_id", uploadImageMiddleware("user_img"), UpdateUserById);
router.put("/users/username/:user_name", uploadImageMiddleware("user_img"), UpdateUserByUsername);
router.put("/users/email/:user_name", uploadImageMiddleware("user_img"), UpdateUserEmailByUsername);
router.put("/users/password/:user_name", uploadImageMiddleware("user_img"), UpdateUserPasswordByUsername);
router.put("/users/profile/socials", uploadNoneMiddleware, UpdateUserProfileWithSocials);
router.patch("/users/cv/:user_name", uploadNoneMiddleware, UpdateUserForCVByUsername);

// === DELETE ===
router.delete("/users/:user_id", DeleteUserById);
router.delete("/users/username/:user_name", DeleteUserByUsername);

export default router;
