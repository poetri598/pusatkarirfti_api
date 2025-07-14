import { createUserAchievement, getAllUserAchievements, getUserAchievementById, updateUserAchievementById, deleteUserAchievementById } from "../models/userAchievementModel.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import { success, fail } from "../utils/responseController.js";

// CREATE
export const CreateUserAchievement = controllerHandler(async (req, res) => {
  const payload = req.body;
  const result = await createUserAchievement(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAllUserAchievements = controllerHandler(async (_req, res) => {
  const rows = await getAllUserAchievements();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserAchievementById = controllerHandler(async (req, res) => {
  const row = await getUserAchievementById(req.params.user_achievement_id);
  if (!row) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", row, 200);
});

// UPDATE BY ID
export const UpdateUserAchievementById = controllerHandler(async (req, res) => {
  const { user_achievement_id } = req.params;
  const existing = await getUserAchievementById(user_achievement_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await updateUserAchievementById(user_achievement_id, req.body);
  const updated = await getUserAchievementById(user_achievement_id);
  return success(res, "Berhasil mengubah data", updated, 200);
});

// DELETE BY ID
export const DeleteUserAchievementById = controllerHandler(async (req, res) => {
  const existing = await getUserAchievementById(req.params.user_achievement_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await deleteUserAchievementById(req.params.user_achievement_id);
  return success(res, "Berhasil menghapus data", existing, 200);
});
