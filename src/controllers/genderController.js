import { createGender, getGenderAll, getGenderById, updateGenderById, deleteGenderById, getGenderByName, searchFilterSortGenders } from "../models/genderModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateGender = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getGenderByName(payload.gender_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createGender({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetGenderAll = controllerHandler(async (_req, res) => {
  const rows = await getGenderAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetGenderById = controllerHandler(async (req, res) => {
  const gender = await getGenderById(req.params.gender_id);
  if (!gender) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", gender, 200);
});

// UPDATE BY ID
export const UpdateGenderById = controllerHandler(async (req, res) => {
  const { gender_id } = req.params;
  const existing = await getGenderById(gender_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const gender_name = req.body.gender_name ?? existing.gender_name;
  const duplicate = await getGenderByName(existing.gender_name);
  if (duplicate && duplicate.gender_id !== Number(existing.gender_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateGenderById(gender_id, {
    ...req.body,
    gender_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteGenderById = controllerHandler(async (req, res) => {
  const result = await deleteGenderById(req.params.gender_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortGenders = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortGenders({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
