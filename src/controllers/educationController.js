import { createEducation, getEducationAll, getEducationById, updateEducationById, deleteEducationById, getEducationByName } from "../models/educationModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateEducation = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getEducationByName(payload.education_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createEducation({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetEducationAll = controllerHandler(async (_req, res) => {
  const rows = await getEducationAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetEducationById = controllerHandler(async (req, res) => {
  const education = await getEducationById(req.params.education_id);
  if (!education) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", education, 200);
});

// UPDATE BY ID
export const UpdateEducationById = controllerHandler(async (req, res) => {
  const { education_id } = req.params;
  const existing = await getEducationById(education_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const education_name = req.body.education_name ?? existing.education_name;
  const duplicate = await getEducationByName(existing.education_name);
  if (duplicate && duplicate.education_id !== Number(existing.education_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateEducationById(education_id, {
    ...req.body,
    education_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteEducationById = controllerHandler(async (req, res) => {
  const result = await deleteEducationById(req.params.education_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortEducations = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCompasearchFilterSortEducations({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
