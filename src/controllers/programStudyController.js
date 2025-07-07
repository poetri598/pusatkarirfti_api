import { createProgramStudy, getProgramStudyAll, getProgramStudyById, updateProgramStudyById, deleteProgramStudyById, getProgramStudyByName, searchFilterSortProgramStudies } from "../models/programStudyModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateProgramStudy = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getProgramStudyByName(payload.program_study_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createProgramStudy({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetProgramStudyAll = controllerHandler(async (_req, res) => {
  const rows = await getProgramStudyAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetProgramStudyById = controllerHandler(async (req, res) => {
  const ProgramStudy = await getProgramStudyById(req.params.program_study_id);
  if (!ProgramStudy) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", ProgramStudy, 200);
});

// UPDATE BY ID
export const UpdateProgramStudyById = controllerHandler(async (req, res) => {
  const { program_study_id } = req.params;
  const existing = await getProgramStudyById(program_study_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const program_study_name = req.body.program_study_name ?? existing.program_study_name;
  const duplicate = await getProgramStudyByName(existing.program_study_name);
  if (duplicate && duplicate.program_study_id !== Number(existing.program_study_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateProgramStudyById(program_study_id, {
    ...req.body,
    program_study_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteProgramStudyById = controllerHandler(async (req, res) => {
  const result = await deleteProgramStudyById(req.params.program_study_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortProgramStudies = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortProgramStudies({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
