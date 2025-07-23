import {
  createUserOrganizationExperiences,
  getUserOrganizationExperiencesAll,
  getUserOrganizationExperienceById,
  updateUserOrganizationExperienceById,
  deleteUserOrganizationExperienceById,
  getUserOrganizationExperiencesByUsername,
  deleteUserOrganizationExperiencesByUsername,
  updateUserOrganizationExperiencesByUsername,
} from "../models/userOrganizationExperienceModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserOrganizationExperiences = controllerHandler(async (req, res) => {
  const { user_id, experiences } = req.body;
  if (!user_id || !experiences) {
    return fail(res, "Pengguna dan pengalaman organisasi diperlukan", 400);
  }
  let parsedExperiences = experiences;
  if (typeof experiences === "string") {
    try {
      parsedExperiences = JSON.parse(experiences);
    } catch (err) {
      return fail(res, "Format experiences tidak valid (harus JSON)", 400);
    }
  }
  const result = await createUserOrganizationExperiences({ user_id, experiences: parsedExperiences });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetUserOrganizationExperiencesAll = controllerHandler(async (_req, res) => {
  const rows = await getUserOrganizationExperiencesAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const { user_organization_experience_id } = req.params;
  const experience = await getUserOrganizationExperienceById(user_organization_experience_id);
  if (!experience) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", experience, 200);
});

// UPDATE BY ID
export const UpdateUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const { user_organization_experience_id } = req.params;
  const existing = await getUserOrganizationExperienceById(user_organization_experience_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);
  let { user_organization_experience_descriptions } = req.body;
  if (typeof user_organization_experience_descriptions === "string") {
    try {
      user_organization_experience_descriptions = JSON.parse(user_organization_experience_descriptions);
    } catch (err) {
      return fail(res, "Format user_organization_experience_descriptions tidak valid (harus JSON)", 400);
    }
  }
  const payload = {
    user_organization_experience_start_date: req.body.user_organization_experience_start_date ?? existing.user_organization_experience_start_date,
    user_organization_experience_end_date: req.body.user_organization_experience_end_date ?? existing.user_organization_experience_end_date,
    user_organization_experience_is_current: req.body.user_organization_experience_is_current ?? existing.user_organization_experience_is_current,
    user_id: req.body.user_id ?? existing.user_id,
    company_id: req.body.company_id ?? existing.company_id,
    position_id: req.body.position_id ?? existing.position_id,
    user_organization_experience_descriptions: user_organization_experience_descriptions ?? [],
  };

  await updateUserOrganizationExperienceById(user_organization_experience_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserOrganizationExperienceById = controllerHandler(async (req, res) => {
  const { user_organization_experience_id } = req.params;
  const result = await deleteUserOrganizationExperienceById(user_organization_experience_id);

  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================

// READ BY USERNAME
export const GetUserOrganizationExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  const rows = await getUserOrganizationExperiencesByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserOrganizationExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  const result = await deleteUserOrganizationExperiencesByUsername(username);
  return success(res, `Berhasil menghapus data`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserOrganizationExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { experiences } = req.body;
  if (!username) return fail(res, "Pengguna tidak ditemukan", 400);
  if (!experiences) return fail(res, "Masukkan pengalaman organisasi", 400);
  let parsedExperiences = experiences;
  if (typeof experiences === "string") {
    try {
      parsedExperiences = JSON.parse(experiences);
    } catch (err) {
      return fail(res, "Format experiences tidak valid (harus JSON)", 400);
    }
  }
  const result = await updateUserOrganizationExperiencesByUsername(username, parsedExperiences);
  return success(res, `Berhasil mengubah data`, result, 200);
});
