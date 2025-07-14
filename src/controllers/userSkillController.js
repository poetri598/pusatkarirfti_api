import { createUserSkill, getAllUserSkills, getUserSkillById, updateUserSkillById, deleteUserSkillById } from "../models/userSkillModel.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import { success, fail } from "../utils/responseController.js";

// CREATE
export const CreateUserSkill = controllerHandler(async (req, res) => {
  const payload = req.body;
  const result = await createUserSkill(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAllUserSkills = controllerHandler(async (_req, res) => {
  const rows = await getAllUserSkills();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserSkillById = controllerHandler(async (req, res) => {
  const row = await getUserSkillById(req.params.user_skill_id);
  if (!row) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", row, 200);
});

// UPDATE BY ID
export const UpdateUserSkillById = controllerHandler(async (req, res) => {
  const { user_skill_id } = req.params;
  const existing = await getUserSkillById(user_skill_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await updateUserSkillById(user_skill_id, req.body);
  const updated = await getUserSkillById(user_skill_id);
  return success(res, "Berhasil mengubah data", updated, 200);
});

// DELETE BY ID
export const DeleteUserSkillById = controllerHandler(async (req, res) => {
  const existing = await getUserSkillById(req.params.user_skill_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await deleteUserSkillById(req.params.user_skill_id);
  return success(res, "Berhasil menghapus data", existing, 200);
});
