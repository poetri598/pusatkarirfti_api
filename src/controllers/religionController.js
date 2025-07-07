import { createReligion, getReligionAll, getReligionById, updateReligionById, deleteReligionById, getReligionByName, searchFilterSortReligions } from "../models/religionModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateReligion = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getReligionByName(payload.religion_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createReligion({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetReligionAll = controllerHandler(async (_req, res) => {
  const rows = await getReligionAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetReligionById = controllerHandler(async (req, res) => {
  const Religion = await getReligionById(req.params.religion_id);
  if (!Religion) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Religion, 200);
});

// UPDATE BY ID
export const UpdateReligionById = controllerHandler(async (req, res) => {
  const { religion_id } = req.params;
  const existing = await getReligionById(religion_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const religion_name = req.body.religion_name ?? existing.religion_name;
  const duplicate = await getReligionByName(existing.religion_name);
  if (duplicate && duplicate.religion_id !== Number(existing.religion_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateReligionById(religion_id, {
    ...req.body,
    religion_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteReligionById = controllerHandler(async (req, res) => {
  const result = await deleteReligionById(req.params.religion_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortReligions = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortReligions({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
