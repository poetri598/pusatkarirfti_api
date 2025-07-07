import { createCountry, getCountryAll, getCountryById, updateCountryById, deleteCountryById, getCountryByName, searchFilterSortCountries } from "../models/countryModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateCountry = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getCountryByName(payload.country_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createCountry({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetCountryAll = controllerHandler(async (_req, res) => {
  const rows = await getCountryAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetCountryById = controllerHandler(async (req, res) => {
  const country = await getCountryById(req.params.country_id);
  if (!country) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", country, 200);
});

// UPDATE BY ID
export const UpdateCountryById = controllerHandler(async (req, res) => {
  const { country_id } = req.params;
  const existing = await getCountryById(country_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const country_name = req.body.country_name ?? existing.country_name;
  const duplicate = await getCountryByName(existing.country_name);
  if (duplicate && duplicate.country_id !== Number(existing.country_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateCountryById(country_id, {
    ...req.body,
    country_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteCountryById = controllerHandler(async (req, res) => {
  const result = await deleteCountryById(req.params.country_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortCountries = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCompasearchFilterSortCountries({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
