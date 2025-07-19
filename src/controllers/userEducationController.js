import {
  createUserEducations,
  getUserEducationsAll,
  getUserEducationById,
  updateUserEducationById,
  deleteUserEducationById,
  getUserEducationsByUsername,
  deleteUserEducationsByUsername,
  updateUserEducationsByUsername,
} from "../models/userEducationModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserEducations = controllerHandler(async (req, res) => {
  const { user_id, educations } = req.body;

  if (!user_id || !educations) {
    return fail(res, "user_id dan educations diperlukan", 400);
  }

  let parsedEducations = educations;
  if (typeof educations === "string") {
    try {
      parsedEducations = JSON.parse(educations);
    } catch (err) {
      return fail(res, "Format educations tidak valid (harus JSON)", 400);
    }
  }

  const result = await createUserEducations({ user_id, educations: parsedEducations });
  return success(res, "Riwayat pendidikan berhasil ditambahkan", result, 201);
});

// READ ALL
export const GetUserEducationsAll = controllerHandler(async (_req, res) => {
  const rows = await getUserEducationsAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserEducationById = controllerHandler(async (req, res) => {
  const { user_education_id } = req.params;
  const education = await getUserEducationById(user_education_id);
  if (!education) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", education, 200);
});

// UPDATE BY ID
export const UpdateUserEducationById = controllerHandler(async (req, res) => {
  const { user_education_id } = req.params;

  const existing = await getUserEducationById(user_education_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);

  const payload = {
    user_education_name: req.body.user_education_name ?? existing.user_education_name,
    user_education_subject: req.body.user_education_subject ?? existing.user_education_subject,
    user_education_admission_date: req.body.user_education_admission_date ?? existing.user_education_admission_date,
    user_education_graduation_date: req.body.user_education_graduation_date ?? existing.user_education_graduation_date,
    user_education_is_current: req.body.user_education_is_current ?? existing.user_education_is_current,
    user_education_final_score: req.body.user_education_final_score ?? existing.user_education_final_score,
    user_id: req.body.user_id ?? existing.user_id,
    education_id: req.body.education_id ?? existing.education_id,
  };

  await updateUserEducationById(user_education_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserEducationById = controllerHandler(async (req, res) => {
  const { user_education_id } = req.params;
  const result = await deleteUserEducationById(user_education_id);

  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================

// READ BY USERNAME
export const GetUserEducationsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const rows = await getUserEducationsByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data berdasarkan username", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserEducationsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const result = await deleteUserEducationsByUsername(username);
  return success(res, `Berhasil menghapus seluruh data pendidikan berdasarkan username: ${username}`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserEducationsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { educations } = req.body;

  if (!username) return fail(res, "Parameter username diperlukan", 400);
  if (!educations) return fail(res, "Parameter educations diperlukan", 400);

  let parsedEducations = educations;
  if (typeof educations === "string") {
    try {
      parsedEducations = JSON.parse(educations);
    } catch (err) {
      return fail(res, "Format educations tidak valid (harus JSON)", 400);
    }
  }

  const result = await updateUserEducationsByUsername(username, parsedEducations);
  return success(res, `Berhasil memperbarui seluruh riwayat pendidikan untuk username: ${username}`, result, 200);
});
