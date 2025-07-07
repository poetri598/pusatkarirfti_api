import { createProvince, getProvinceAll, getProvinceById, updateProvinceById, deleteProvinceById, getProvinceByName, searchFilterSortProvinces } from "../models/provinceModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateProvince = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getProvinceByName(payload.province_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createProvince({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetProvinceAll = controllerHandler(async (_req, res) => {
  const rows = await getProvinceAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetProvinceById = controllerHandler(async (req, res) => {
  const Province = await getProvinceById(req.params.province_id);
  if (!Province) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Province, 200);
});

// UPDATE BY ID
export const UpdateProvinceById = controllerHandler(async (req, res) => {
  const { province_id } = req.params;
  const existing = await getProvinceById(province_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const province_name = req.body.province_name ?? existing.province_name;
  const duplicate = await getProvinceByName(existing.province_name);
  if (duplicate && duplicate.province_id !== Number(existing.province_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateProvinceById(province_id, {
    ...req.body,
    province_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteProvinceById = controllerHandler(async (req, res) => {
  const result = await deleteProvinceById(req.params.province_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortProvinces = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortProvinces({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
