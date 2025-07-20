import {
  createTraining,
  getTrainingAll,
  getTrainingById,
  updateTrainingById,
  deleteTrainingById,
  getTrainingBySlug,
  getThreeLatestTraining,
  getTrainingAllExceptSlug,
  incrementViewBySlug,
  searchFilterSortTrainings,
  searchFilterSortTrainingsActive,
  getSummary,
} from "../models/trainingModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { generateSlug } from "../utils/generateSlug.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateTraining = controllerHandler(async (req, res) => {
  const payload = req.body;
  const training_slug = generateSlug(payload.training_name);
  if (await getTrainingBySlug(training_slug)) return fail(res, "Data judul sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const training_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createTraining({
    ...payload,
    training_slug,
    training_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetTrainingAll = controllerHandler(async (_req, res) => {
  const rows = await getTrainingAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetTrainingById = controllerHandler(async (req, res) => {
  const Training = await getTrainingById(req.params.training_id);
  if (!Training) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Training, 200);
});

// UPDATE
export const UpdateTrainingById = controllerHandler(async (req, res) => {
  const { training_id } = req.params;
  const existing = await getTrainingById(training_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const training_img = req.file ? await bufferToBase64(req.file.buffer) : existing.training_img;
  const training_name = req.body.training_name ?? existing.training_name;
  const training_slug = generateSlug(training_name);
  const duplicate = await getTrainingBySlug(training_slug);
  if (duplicate && duplicate.training_id !== Number(training_id)) return fail(res, "Data judul sudah tersedia", 409);
  await updateTrainingById(training_id, {
    ...req.body,
    training_name,
    training_slug,
    training_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteTrainingById = controllerHandler(async (req, res) => {
  const result = await deleteTrainingById(req.params.training_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ BY SLUG
export const GetTrainingBySlug = controllerHandler(async (req, res) => {
  const Training = await getTrainingBySlug(req.params.training_slug);
  if (!Training) return fail(res, "Data judul tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Training, 200);
});

// READ THREE LATEST
export const GetThreeLatestTraining = controllerHandler(async (_req, res) => {
  const rows = await getThreeLatestTraining();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ALL EXCEPT SLUG
export const GetTrainingAllExceptSlug = controllerHandler(async (req, res) => {
  const { training_slug } = req.params;
  const rows = await getTrainingAllExceptSlug(training_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// UPDATE VIEW
export const IncrementViewBySlug = controllerHandler(async (req, res) => {
  const { training_slug } = req.params;
  const existing = await getTrainingBySlug(training_slug);
  if (!existing) return fail(res, "Data judul tidak ditemukan", 404);
  await incrementViewBySlug(training_slug);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortTrainings = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortTrainings({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// SEARCH FILTER SORT ACTIVE
export const SearchFilterSortTrainingsActive = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortTrainingsActive({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// GET SUMMARY
export const GetSummary = controllerHandler(async (_req, res) => {
  const summary = await getSummary();
  if (!summary) return success(res, "Data tidak ditemukan", {}, 200);
  return success(res, "Berhasil mengambil ringkasan data", summary, 200);
});
