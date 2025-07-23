import {
  createUserAchievements,
  getUserAchievementsAll,
  getUserAchievementById,
  updateUserAchievementById,
  deleteUserAchievementById,
  getUserAchievementsByUsername,
  deleteUserAchievementsByUsername,
  updateUserAchievementsByUsername,
} from "../models/userAchievementModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserAchievements = controllerHandler(async (req, res) => {
  const { user_id, achievements } = req.body;
  if (!user_id || !achievements) {
    return fail(res, "Pengguna dan penghargaan diperlukan", 400);
  }
  let parsedAchievements = achievements;
  if (typeof achievements === "string") {
    try {
      parsedAchievements = JSON.parse(achievements);
    } catch (err) {
      return fail(res, "Format achievements tidak valid (harus JSON)", 400);
    }
  }
  const result = await createUserAchievements({ user_id, achievements: parsedAchievements });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetUserAchievementsAll = controllerHandler(async (_req, res) => {
  const rows = await getUserAchievementsAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserAchievementById = controllerHandler(async (req, res) => {
  const { user_achievement_id } = req.params;
  const achievement = await getUserAchievementById(user_achievement_id);
  if (!achievement) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", achievement, 200);
});

// UPDATE BY ID
export const UpdateUserAchievementById = controllerHandler(async (req, res) => {
  const { user_achievement_id } = req.params;
  const existing = await getUserAchievementById(user_achievement_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);
  const payload = {
    user_achievement_name: req.body.user_achievement_name ?? existing.user_achievement_name,
    user_achievement_date: req.body.user_achievement_date ?? existing.user_achievement_date,
    user_id: req.body.user_id ?? existing.user_id,
    company_id: req.body.company_id ?? existing.company_id,
  };
  await updateUserAchievementById(user_achievement_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserAchievementById = controllerHandler(async (req, res) => {
  const { user_achievement_id } = req.params;
  const result = await deleteUserAchievementById(user_achievement_id);
  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ===================================================================================================

// READ BY USERNAME
export const GetUserAchievementsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  const rows = await getUserAchievementsByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserAchievementsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  const result = await deleteUserAchievementsByUsername(username);
  return success(res, `Berhasil menghapus data`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserAchievementsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { achievements } = req.body;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  if (!achievements) return fail(res, "Masukkan penghargaan", 400);
  let parsedAchievements = achievements;
  if (typeof achievements === "string") {
    try {
      parsedAchievements = JSON.parse(achievements);
    } catch (err) {
      return fail(res, "Format achievements tidak valid (harus JSON)", 400);
    }
  }
  const result = await updateUserAchievementsByUsername(username, parsedAchievements);
  return success(res, `Berhasil mengubah data`, result, 200);
});
