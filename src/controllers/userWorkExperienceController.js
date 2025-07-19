import {
  createUserWorkExperiences,
  getUserWorkExperiencesAll,
  getUserWorkExperienceById,
  updateUserWorkExperienceById,
  deleteUserWorkExperienceById,
  getUserWorkExperiencesByUsername,
  deleteUserWorkExperiencesByUsername,
  updateUserWorkExperiencesByUsername,
} from "../models/userWorkExperienceModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserWorkExperiences = controllerHandler(async (req, res) => {
  const { user_id, experiences } = req.body;

  if (!user_id || !experiences) {
    return fail(res, "user_id dan user_work_experience diperlukan", 400);
  }

  let parsedExperiences = experiences;

  if (typeof experiences === "string") {
    try {
      parsedExperiences = JSON.parse(experiences);
    } catch (err) {
      return fail(res, "Format user_work_experience_descriptions tidak valid (harus JSON)", 400);
    }
  }

  const result = await createUserWorkExperiences({ user_id, experiences: parsedExperiences });
  return success(res, "Pengalaman kerja berhasil ditambahkan", result, 201);
});

// READ ALL
export const GetUserWorkExperiencesAll = controllerHandler(async (_req, res) => {
  const rows = await getUserWorkExperiencesAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserWorkExperienceById = controllerHandler(async (req, res) => {
  const { user_work_experience_id } = req.params;
  const experience = await getUserWorkExperienceById(user_work_experience_id);
  if (!experience) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", experience, 200);
});

// UPDATE BY ID
export const UpdateUserWorkExperienceById = controllerHandler(async (req, res) => {
  const { user_work_experience_id } = req.params;

  const existing = await getUserWorkExperienceById(user_work_experience_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);

  let { user_work_experience_descriptions } = req.body;

  if (typeof user_work_experience_descriptions === "string") {
    try {
      user_work_experience_descriptions = JSON.parse(user_work_experience_descriptions);
    } catch (err) {
      return fail(res, "Format user_work_experience_descriptions tidak valid (harus JSON)", 400);
    }
  }

  const payload = {
    user_work_experience_start_date: req.body.user_work_experience_start_date ?? existing.user_work_experience_start_date,
    user_work_experience_end_date: req.body.user_work_experience_end_date ?? existing.user_work_experience_end_date,
    user_work_experience_is_current: req.body.user_work_experience_is_current ?? existing.user_work_experience_is_current,
    user_id: req.body.user_id ?? existing.user_id,
    company_id: req.body.company_id ?? existing.company_id,
    position_id: req.body.position_id ?? existing.position_id,
    user_work_experience_descriptions: user_work_experience_descriptions ?? [],
  };

  await updateUserWorkExperienceById(user_work_experience_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserWorkExperienceById = controllerHandler(async (req, res) => {
  const { user_work_experience_id } = req.params;
  const result = await deleteUserWorkExperienceById(user_work_experience_id);

  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ BY USERNAME
export const GetUserWorkExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return fail(res, "Parameter username diperlukan", 400);
  }
  const rows = await getUserWorkExperiencesByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data berdasarkan username", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserWorkExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return fail(res, "Parameter username diperlukan", 400);
  }
  const result = await deleteUserWorkExperiencesByUsername(username);
  if (result.affectedRows === 0) {
    return fail(res, `Tidak ada data pengalaman kerja untuk username: ${username}`, 404);
  }
  return success(res, `Berhasil menghapus semua pengalaman kerja untuk username: ${username}`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserWorkExperiencesByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { experiences } = req.body;
  if (!username) return fail(res, "Parameter username diperlukan", 400);
  if (!experiences) return fail(res, "Parameter experiences diperlukan", 400);
  let parsedExperiences = experiences;
  if (typeof experiences === "string") {
    try {
      parsedExperiences = JSON.parse(experiences);
    } catch (err) {
      return fail(res, "Format experiences tidak valid (harus JSON)", 400);
    }
  }
  const result = await updateUserWorkExperiencesByUsername(username, parsedExperiences);
  return success(res, "Berhasil memperbarui seluruh pengalaman kerja berdasarkan username", result, 200);
});
