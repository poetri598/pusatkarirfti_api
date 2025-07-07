import { createExperience, getExperienceAll, getExperienceById, updateExperienceById, deleteExperienceById, getExperienceByName, searchFilterSortExperiences } from "../models/experienceModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateExperience = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getExperienceByName(payload.experience_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createExperience({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetExperienceAll = controllerHandler(async (_req, res) => {
  const rows = await getExperienceAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetExperienceById = controllerHandler(async (req, res) => {
  const experience = await getExperienceById(req.params.experience_id);
  if (!experience) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", experience, 200);
});

// UPDATE BY ID
export const UpdateExperienceById = controllerHandler(async (req, res) => {
  const { experience_id } = req.params;
  const existing = await getExperienceById(experience_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const experience_name = req.body.experience_name ?? existing.experience_name;
  const duplicate = await getExperienceByName(existing.experience_name);
  if (duplicate && duplicate.experience_id !== Number(existing.experience_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateExperienceById(experience_id, {
    ...req.body,
    experience_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteExperienceById = controllerHandler(async (req, res) => {
  const result = await deleteExperienceById(req.params.experience_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortExperiences = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortExperiences({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
