import { createJobType, getJobTypeAll, getJobTypeById, updateJobTypeById, deleteJobTypeById, getJobTypeByName, searchFilterSortJobTypes } from "../models/jobTypeModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateJobType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getJobTypeByName(payload.job_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createJobType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetJobTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getJobTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetJobTypeById = controllerHandler(async (req, res) => {
  const JobType = await getJobTypeById(req.params.job_type_id);
  if (!JobType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", JobType, 200);
});

// UPDATE BY ID
export const UpdateJobTypeById = controllerHandler(async (req, res) => {
  const { job_type_id } = req.params;
  const existing = await getJobTypeById(job_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const job_type_name = req.body.job_type_name ?? existing.job_type_name;
  const duplicate = await getJobTypeByName(existing.job_type_name);
  if (duplicate && duplicate.job_type_id !== Number(existing.job_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateJobTypeById(job_type_id, {
    ...req.body,
    job_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteJobTypeById = controllerHandler(async (req, res) => {
  const result = await deleteJobTypeById(req.params.job_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortJobTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortJobTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
