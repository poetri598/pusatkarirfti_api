import { createPosition, getPositionAll, getPositionById, getPositionByName, updatePositionById, deletePositionById, searchFilterSortPositions } from "../models/positionModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreatePosition = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getPositionByName(payload.position_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createPosition({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetPositionAll = controllerHandler(async (_req, res) => {
  const rows = await getPositionAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetPositionById = controllerHandler(async (req, res) => {
  const Position = await getPositionById(req.params.position_id);
  if (!Position) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Position, 200);
});

// UPDATE BY ID
export const UpdatePositionById = controllerHandler(async (req, res) => {
  const { position_id } = req.params;
  const existing = await getPositionById(position_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const position_name = req.body.position_name ?? existing.position_name;
  const duplicate = await getPositionByName(existing.position_name);
  if (duplicate && duplicate.position_id !== Number(existing.position_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updatePositionById(position_id, {
    ...req.body,
    position_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeletePositionById = controllerHandler(async (req, res) => {
  const result = await deletePositionById(req.params.position_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortPositions = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortPositions({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
