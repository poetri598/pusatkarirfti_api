import { createHeight, getHeightAll, getHeightById, updateHeightById, deleteHeightById, getHeightByNo, searchFilterSortHeights } from "../models/heightModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateHeight = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getHeightByNo(payload.height_no)) return fail(res, "Data tinggi sudah tersedia", 409);
  const result = await createHeight({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetHeightAll = controllerHandler(async (_req, res) => {
  const rows = await getHeightAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetHeightById = controllerHandler(async (req, res) => {
  const Height = await getHeightById(req.params.height_id);
  if (!Height) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Height, 200);
});

// UPDATE BY ID
export const UpdateHeightById = controllerHandler(async (req, res) => {
  const { height_id } = req.params;
  const existing = await getHeightById(height_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const height_no = req.body.height_no ?? existing.height_no;
  const duplicate = await getHeightByNo(existing.height_no);
  if (duplicate && duplicate.height_id !== Number(existing.height_id)) return fail(res, "Data tinggi sudah tersedia", 409);
  await updateHeightById(height_id, {
    ...req.body,
    height_no,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteHeightById = controllerHandler(async (req, res) => {
  const result = await deleteHeightById(req.params.height_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortHeights = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortHeights({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
