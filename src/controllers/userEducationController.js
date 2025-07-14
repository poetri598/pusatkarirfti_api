import { createUserEducation, getAllUserEducations, getUserEducationById, updateUserEducationById, deleteUserEducationById } from "../models/userEducationModel.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import { success, fail } from "../utils/responseController.js";

// CREATE
export const CreateUserEducation = controllerHandler(async (req, res) => {
  const payload = req.body;
  const result = await createUserEducation(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAllUserEducations = controllerHandler(async (_req, res) => {
  const rows = await getAllUserEducations();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserEducationById = controllerHandler(async (req, res) => {
  const row = await getUserEducationById(req.params.user_education_id);
  if (!row) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", row, 200);
});

// UPDATE BY ID
export const UpdateUserEducationById = controllerHandler(async (req, res) => {
  const { user_education_id } = req.params;
  const existing = await getUserEducationById(user_education_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await updateUserEducationById(user_education_id, req.body);
  const updated = await getUserEducationById(user_education_id);
  return success(res, "Berhasil mengubah data", updated, 200);
});

// DELETE BY ID
export const DeleteUserEducationById = controllerHandler(async (req, res) => {
  const result = await deleteUserEducationById(req.params.user_education_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});
