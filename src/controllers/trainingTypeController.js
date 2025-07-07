import { createTrainingType, getTrainingTypeAll, getTrainingTypeById, updateTrainingTypeById, deleteTrainingTypeById, getTrainingTypeByName, searchFilterSortTrainingTypes } from "../models/trainingTypeModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateTrainingType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getTrainingTypeByName(payload.training_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createTrainingType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetTrainingTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getTrainingTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetTrainingTypeById = controllerHandler(async (req, res) => {
  const TrainingType = await getTrainingTypeById(req.params.training_type_id);
  if (!TrainingType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Training type fetched successfully", TrainingType, 200);
});

// UPDATE BY ID
export const UpdateTrainingTypeById = controllerHandler(async (req, res) => {
  const { training_type_id } = req.params;
  const existing = await getTrainingTypeById(training_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const training_type_name = req.body.training_type_name ?? existing.training_type_name;
  const duplicate = await getTrainingTypeByName(existing.training_type_name);
  if (duplicate && duplicate.training_type_id !== Number(existing.training_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateTrainingTypeById(training_type_id, {
    ...req.body,
    training_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteTrainingTypeById = controllerHandler(async (req, res) => {
  const result = await deleteTrainingTypeById(req.params.training_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortTrainingTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortTrainingTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
