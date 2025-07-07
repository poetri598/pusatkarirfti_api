import { createAge, getAgeAll, getAgeById, updateAgeById, deleteAgeById, getAgeByNo, searchFilterSortAges } from "../models/ageModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateAge = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getAgeByNo(payload.age_no)) return fail(res, "Data umur sudah tersedia", 409);
  const result = await createAge({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetAgeAll = controllerHandler(async (_req, res) => {
  const rows = await getAgeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetAgeById = controllerHandler(async (req, res) => {
  const age = await getAgeById(req.params.age_id);
  if (!age) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", age, 200);
});

// UPDATE BY ID
export const UpdateAgeById = controllerHandler(async (req, res) => {
  const { age_id } = req.params;
  const existing = await getAgeById(age_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const age_no = req.body.age_no ?? existing.age_no;
  const duplicate = await getAgeByNo(existing.age_no);
  if (duplicate && duplicate.age_id !== Number(existing.age_id)) return fail(res, "Data umur sudah tersedia", 409);
  await updateAgeById(age_id, {
    ...req.body,
    age_no,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteAgeById = controllerHandler(async (req, res) => {
  const result = await deleteAgeById(req.params.age_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortAges = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortAges({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
