import {
  createExpo,
  getExpoAll,
  getExpoById,
  updateExpoById,
  deleteExpoById,
  getExpoBySlug,
  getThreeLatestExpo,
  getExpoAllExceptSlug,
  incrementViewBySlug,
  searchFilterSortExpos,
  searchFilterSortExposActive,
  getSummary,
} from "../models/expoModel.js";

import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { generateSlug } from "../utils/generateSlug.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateExpo = controllerHandler(async (req, res) => {
  const payload = req.body;
  const expo_slug = generateSlug(payload.expo_name);
  if (await getExpoBySlug(expo_slug)) return fail(res, "Data judul sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const expo_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createExpo({
    ...payload,
    expo_slug,
    expo_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetExpoAll = controllerHandler(async (_req, res) => {
  const rows = await getExpoAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetExpoById = controllerHandler(async (req, res) => {
  const expo = await getExpoById(req.params.expo_id);
  if (!expo) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", expo, 200);
});

// UPDATE BY ID
export const UpdateExpoById = controllerHandler(async (req, res) => {
  const { expo_id } = req.params;
  const existing = await getExpoById(expo_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const expo_img = req.file ? await bufferToBase64(req.file.buffer) : existing.expo_img;
  const expo_name = req.body.expo_name ?? existing.expo_name;
  const expo_slug = generateSlug(expo_name);
  const duplicate = await getExpoBySlug(expo_slug);
  if (duplicate && duplicate.expo_id !== Number(expo_id)) return fail(res, "Data judul sudah tersedia", 409);
  await updateExpoById(expo_id, {
    ...req.body,
    expo_name,
    expo_slug,
    expo_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteExpoById = controllerHandler(async (req, res) => {
  const result = await deleteExpoById(req.params.expo_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ BY SLUG
export const GetExpoBySlug = controllerHandler(async (req, res) => {
  const expo = await getExpoBySlug(req.params.expo_slug);
  if (!expo) return fail(res, "Data judul tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", expo, 200);
});

// READ THREE LATEST
export const GetThreeLatestExpo = controllerHandler(async (_req, res) => {
  const rows = await getThreeLatestExpo();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ALL EXCEPT SLUG
export const GetExpoAllExceptSlug = controllerHandler(async (req, res) => {
  const { expo_slug } = req.params;
  const rows = await getExpoAllExceptSlug(expo_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// UPDATE VIEW
export const IncrementViewBySlug = controllerHandler(async (req, res) => {
  const { expo_slug } = req.params;
  const existing = await getExpoBySlug(expo_slug);
  if (!existing) return fail(res, "Data judul tidak ditemukan", 404);
  await incrementViewBySlug(expo_slug);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortExpos = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortExpos({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// SEARCH FILTER SORT ACTIVE
export const SearchFilterSortExposActive = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortExposActive({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// GET SUMMARY
export const GetSummary = controllerHandler(async (_req, res) => {
  const summary = await getSummary();
  if (!summary) return success(res, "Data tidak ditemukan", {}, 200);
  return success(res, "Berhasil mengambil ringkasan data", summary, 200);
});
