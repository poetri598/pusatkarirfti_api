import { createStatus, getStatusAll, getStatusById, updateStatusById, deleteStatusById, getStatusByName, searchFilterSortStatuses } from "../models/statusModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateStatus = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getStatusByName(payload.status_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createStatus({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetStatusAll = controllerHandler(async (_req, res) => {
  const rows = await getStatusAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetStatusById = controllerHandler(async (req, res) => {
  const Status = await getStatusById(req.params.status_id);
  if (!Status) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Status, 200);
});

// UPDATE BY ID
export const UpdateStatusById = controllerHandler(async (req, res) => {
  const { status_id } = req.params;
  const existing = await getStatusById(status_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const status_name = req.body.status_name ?? existing.status_name;
  const duplicate = await getStatusByName(existing.status_name);
  if (duplicate && duplicate.status_id !== Number(existing.status_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateStatusById(status_id, {
    ...req.body,
    status_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteStatusById = controllerHandler(async (req, res) => {
  const result = await deleteStatusById(req.params.status_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortStatuses = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortStatuses({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
