import { createWeight, getWeightAll, getWeightById, updateWeightById, deleteWeightById, getWeightByNo, searchFilterSortWeights } from "../models/weightModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateWeight = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getWeightByNo(payload.weight_no)) return fail(res, "Data berat badan sudah tersedia", 409);
  const result = await createWeight({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetWeightAll = controllerHandler(async (_req, res) => {
  const rows = await getWeightAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetWeightById = controllerHandler(async (req, res) => {
  const Weight = await getWeightById(req.params.weight_id);
  if (!Weight) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Weight, 200);
});

// UPDATE BY ID
export const UpdateWeightById = controllerHandler(async (req, res) => {
  const { weight_id } = req.params;
  const existing = await getWeightById(weight_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const weight_no = req.body.weight_no ?? existing.weight_no;
  const duplicate = await getWeightByNo(existing.weight_no);
  if (duplicate && duplicate.weight_id !== Number(existing.weight_id)) return fail(res, "Data tinggi badan sudah tersedia", 409);
  await updateWeightById(weight_id, {
    ...req.body,
    weight_no,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteWeightById = controllerHandler(async (req, res) => {
  const result = await deleteWeightById(req.params.weight_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortWeights = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortWeights({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
