import { createUserWorkExperience, getAllUserWorkExperiences, getUserWorkExperienceById, updateUserWorkExperienceById, deleteUserWorkExperienceById } from "../models/userWorkExperienceModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserWorkExperience = controllerHandler(async (req, res) => {
  const result = await createUserWorkExperience(req.body);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAllUserWorkExperiences = controllerHandler(async (_req, res) => {
  const rows = await getAllUserWorkExperiences();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserWorkExperienceById = controllerHandler(async (req, res) => {
  const result = await getUserWorkExperienceById(req.params.user_work_experience_id);
  if (!result) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", result, 200);
});

// UPDATE BY ID
export const UpdateUserWorkExperienceById = controllerHandler(async (req, res) => {
  const existing = await getUserWorkExperienceById(req.params.user_work_experience_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await updateUserWorkExperienceById(req.params.user_work_experience_id, req.body);
  const updated = await getUserWorkExperienceById(req.params.user_work_experience_id);
  return success(res, "Berhasil mengubah data", updated, 200);
});

// DELETE BY ID
export const DeleteUserWorkExperienceById = controllerHandler(async (req, res) => {
  const existing = await getUserWorkExperienceById(req.params.user_work_experience_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const result = await deleteUserWorkExperienceById(req.params.user_work_experience_id);
  return success(res, "Berhasil menghapus data", result, 200);
});
