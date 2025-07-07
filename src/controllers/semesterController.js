import { createSemester, getSemesterAll, getSemesterById, updateSemesterById, deleteSemesterById, getSemesterByNo, searchFilterSortSemesters } from "../models/semesterModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateSemester = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getSemesterByNo(payload.semester_no)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createSemester({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetSemesterAll = controllerHandler(async (_req, res) => {
  const rows = await getSemesterAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetSemesterById = controllerHandler(async (req, res) => {
  const Semester = await getSemesterById(req.params.semester_id);
  if (!Semester) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Semester, 200);
});

// UPDATE BY ID
export const UpdateSemesterById = controllerHandler(async (req, res) => {
  const { semester_id } = req.params;
  const existing = await getSemesterById(semester_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const semester_no = req.body.semester_no ?? existing.semester_no;
  const duplicate = await getSemesterByNo(existing.semester_no);
  if (duplicate && duplicate.semester_id !== Number(existing.semester_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateSemesterById(semester_id, {
    ...req.body,
    semester_no,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteSemesterById = controllerHandler(async (req, res) => {
  const result = await deleteSemesterById(req.params.semester_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortSemesters = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortSemesters({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
