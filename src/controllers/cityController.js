import { createCity, getCityAll, getCityById, updateCityById, deleteCityById, getCityByName, searchFilterSortCities } from "../models/cityModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateCity = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getCityByName(payload.city_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createCity({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetCityAll = controllerHandler(async (_req, res) => {
  const rows = await getCityAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetCityById = controllerHandler(async (req, res) => {
  const City = await getCityById(req.params.city_id);
  if (!City) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", City, 200);
});

// UPDATE BY ID
export const UpdateCityById = controllerHandler(async (req, res) => {
  const { city_id } = req.params;
  const existing = await getCityById(city_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const city_name = req.body.city_name ?? existing.city_name;
  const duplicate = await getCityByName(city_name);
  if (duplicate && duplicate.city_id !== Number(existing.city_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateCityById(city_id, {
    ...req.body,
    city_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteCityById = controllerHandler(async (req, res) => {
  const result = await deleteCityById(req.params.city_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortCities = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCities({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
