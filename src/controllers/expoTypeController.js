import { createExpoType, getExpoTypeAll, getExpoTypeById, getExpoTypeByName, updateExpoTypeById, deleteExpoTypeById, searchFilterSortExpoTypes } from "../models/expoTypeModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateExpoType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getExpoTypeByName(payload.expo_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createExpoType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetExpoTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getExpoTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetExpoTypeById = controllerHandler(async (req, res) => {
  const ExpoType = await getExpoTypeById(req.params.expo_type_id);
  if (!ExpoType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", ExpoType, 200);
});

// UPDATE BY ID
export const UpdateExpoTypeById = controllerHandler(async (req, res) => {
  const { expo_type_id } = req.params;
  const existing = await getExpoTypeById(expo_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const expo_type_name = req.body.expo_type_name ?? existing.expo_type_name;
  const duplicate = await getExpoTypeByName(existing.expo_type_name);
  if (duplicate && duplicate.expo_type_id !== Number(existing.expo_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateExpoTypeById(expo_type_id, {
    ...req.body,
    expo_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteExpoTypeById = controllerHandler(async (req, res) => {
  const result = await deleteExpoTypeById(req.params.expo_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortExpoTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortExpoTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
