import { createMaritalStatus, getMaritalStatusAll, getMaritalStatusById, updateMaritalStatusById, deleteMaritalStatusById, getMaritalStatusByName, searchFilterSortMaritalStatuses } from "../models/maritalStatusModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateMaritalStatus = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getMaritalStatusByName(payload.marital_status_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createMaritalStatus({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetMaritalStatusAll = controllerHandler(async (_req, res) => {
  const rows = await getMaritalStatusAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetMaritalStatusById = controllerHandler(async (req, res) => {
  const MaritalStatus = await getMaritalStatusById(req.params.marital_status_id);
  if (!MaritalStatus) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", MaritalStatus, 200);
});

// UPDATE BY ID
export const UpdateMaritalStatusById = controllerHandler(async (req, res) => {
  const { marital_status_id } = req.params;
  const existing = await getMaritalStatusById(marital_status_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const marital_status_name = req.body.marital_status_name ?? existing.marital_status_name;
  const duplicate = await getMaritalStatusByName(existing.marital_status_name);
  if (duplicate && duplicate.marital_status_id !== Number(existing.marital_status_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateMaritalStatusById(marital_status_id, {
    ...req.body,
    marital_status_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteMaritalStatusById = controllerHandler(async (req, res) => {
  const result = await deleteMaritalStatusById(req.params.marital_status_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortMaritalStatuses = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortMaritalStatuses({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
