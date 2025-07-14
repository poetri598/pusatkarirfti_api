// src/controllers/platformController.js

import { createPlatform, getPlatformAll, getPlatformById, updatePlatformById, deletePlatformById, getPlatformByName, searchFilterSortPlatforms } from "../models/platformModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreatePlatform = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getPlatformByName(payload.platform_name)) return fail(res, "Data nama sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const platform_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createPlatform({
    ...payload,
    platform_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetPlatformAll = controllerHandler(async (_req, res) => {
  const rows = await getPlatformAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetPlatformById = controllerHandler(async (req, res) => {
  const platform = await getPlatformById(req.params.platform_id);
  if (!platform) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", platform, 200);
});

// UPDATE BY ID
export const UpdatePlatformById = controllerHandler(async (req, res) => {
  const { platform_id } = req.params;
  const existing = await getPlatformById(platform_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const platform_name = req.body.platform_name ?? existing.platform_name;
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const platform_img = req.file ? await bufferToBase64(req.file.buffer) : existing.platform_img;
  const duplicate = await getPlatformByName(platform_name);
  if (duplicate && duplicate.platform_id !== Number(existing.platform_id)) {
    return fail(res, "Data nama sudah tersedia", 409);
  }
  await updatePlatformById(platform_id, {
    ...req.body,
    platform_name,
    platform_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeletePlatformById = controllerHandler(async (req, res) => {
  const result = await deletePlatformById(req.params.platform_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortPlatforms = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortPlatforms({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
