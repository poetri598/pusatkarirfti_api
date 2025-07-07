import { createCounselingType, getCounselingTypeAll, getCounselingTypeById, getCounselingTypeByName, updateCounselingTypeById, deleteCounselingTypeById, searchFilterSortCounselingTypes } from "../models/counselingTypeModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateCounselingType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getCounselingTypeByName(payload.counseling_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createCounselingType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetCounselingTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getCounselingTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetCounselingTypeById = controllerHandler(async (req, res) => {
  const counselingType = await getCounselingTypeById(req.params.counseling_type_id);
  if (!counselingType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", counselingType, 200);
});

// UPDATE BY ID
export const UpdateCounselingTypeById = controllerHandler(async (req, res) => {
  const { counseling_type_id } = req.params;
  const existing = await getCounselingTypeById(counseling_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const counseling_type_name = req.body.counseling_type_name ?? existing.counseling_type_name;
  const duplicate = await getCounselingTypeByName(existing.counseling_type_name);
  if (duplicate && duplicate.counseling_type_id !== Number(existing.counseling_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateCounselingTypeById(counseling_type_id, {
    ...req.body,
    counseling_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteCounselingTypeById = controllerHandler(async (req, res) => {
  const result = await deleteCounselingTypeById(req.params.counseling_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortCounselingTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCompasearchFilterSortCounselingTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
