import { createMode, getModeAll, getModeById, updateModeById, deleteModeById, getModeByName, searchFilterSortModes } from "../models/modeModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateMode = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getModeByName(payload.mode_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createMode({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetModeAll = controllerHandler(async (_req, res) => {
  const rows = await getModeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetModeById = controllerHandler(async (req, res) => {
  const Mode = await getModeById(req.params.mode_id);
  if (!Mode) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Mode, 200);
});

// UPDATE BY ID
export const UpdateModeById = controllerHandler(async (req, res) => {
  const { mode_id } = req.params;
  const existing = await getModeById(mode_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const mode_name = req.body.mode_name ?? existing.mode_name;
  const duplicate = await getModeByName(existing.mode_name);
  if (duplicate && duplicate.mode_id !== Number(existing.mode_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateModeById(mode_id, {
    ...req.body,
    mode_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteModeById = controllerHandler(async (req, res) => {
  const result = await deleteModeById(req.params.mode_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortModes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortModes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
