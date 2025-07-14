import {
  createUserOrganizationExperience,
  getAllUserOrganizationExperiences,
  getUserOrganizationExperienceById,
  updateUserOrganizationExperienceById,
  deleteUserOrganizationExperienceById,
} from "../models/userOrganizationExperienceModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserOrganizationExperience = controllerHandler(async (req, res) => {
  const payload = req.body;
  const result = await createUserOrganizationExperience(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAllUserOrganizationExperiences = controllerHandler(async (_req, res) => {
  const rows = await getAllUserOrganizationExperiences();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const data = await getUserOrganizationExperienceById(req.params.id);
  if (!data) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", data, 200);
});

// UPDATE BY ID
export const UpdateUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const existing = await getUserOrganizationExperienceById(req.params.id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await updateUserOrganizationExperienceById(req.params.id, req.body);
  const updated = await getUserOrganizationExperienceById(req.params.id);
  return success(res, "Berhasil mengubah data", updated, 200);
});

// DELETE BY ID
export const DeleteUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const result = await deleteUserOrganizationExperienceById(req.params.id);
  if (result?.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});
