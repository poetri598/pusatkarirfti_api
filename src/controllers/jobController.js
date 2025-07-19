import {
  createJob,
  getJobAll,
  getJobById,
  updateJobById,
  deleteJobById,
  getJobBySlug,
  getThreeLatestJob,
  getJobAllExceptSlug,
  incrementViewBySlug,
  searchFilterSortJobs,
  searchFilterSortJobsActive,
  getJobSummary,
} from "../models/jobModel.js";

import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { generateSlug } from "../utils/generateSlug.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateJob = controllerHandler(async (req, res) => {
  const payload = req.body;
  const job_slug = generateSlug(payload.job_name);
  if (await getJobBySlug(job_slug)) return fail(res, "Data judul sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const job_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createJob({
    ...payload,
    job_slug,
    job_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetJobAll = controllerHandler(async (_req, res) => {
  const rows = await getJobAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetJobById = controllerHandler(async (req, res) => {
  const job = await getJobById(req.params.job_id);
  if (!job) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", job, 200);
});

// UPDATE BY ID
export const UpdateJobById = controllerHandler(async (req, res) => {
  const { job_id } = req.params;
  const existing = await getJobById(job_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const job_img = req.file ? await bufferToBase64(req.file.buffer) : existing.job_img;
  const job_name = req.body.job_name ?? existing.job_name;
  const job_slug = generateSlug(job_name);
  const duplicate = await getJobBySlug(job_slug);
  if (duplicate && duplicate.job_id !== Number(job_id)) return fail(res, "Data judul sudah tersedia", 409);
  await updateJobById(job_id, {
    ...req.body,
    job_name,
    job_slug,
    job_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteJobById = controllerHandler(async (req, res) => {
  const result = await deleteJobById(req.params.job_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

//==============================================================================================================================================================

// READ BY SLUG
export const GetJobBySlug = controllerHandler(async (req, res) => {
  const job = await getJobBySlug(req.params.job_slug);
  if (!job) return fail(res, "Data judul tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", job, 200);
});

// READ THREE LATEST
export const GetThreeLatestJob = controllerHandler(async (_req, res) => {
  const rows = await getThreeLatestJob();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ALL EXCEPT SLUG
export const GetJobAllExceptSlug = controllerHandler(async (req, res) => {
  const { job_slug } = req.params;
  const rows = await getJobAllExceptSlug(job_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// UPDATE VIEW
export const IncrementViewBySlug = controllerHandler(async (req, res) => {
  const { job_slug } = req.params;
  const existing = await getJobBySlug(job_slug);
  if (!existing) return fail(res, "Data judul tidak ditemukan", 404);
  await incrementViewBySlug(job_slug);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortJobs = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortJobs({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// SEARCH FILTER SORT ACTIVE
export const SearchFilterSortJobsActive = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortJobsActive({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// GET JOB SUMMARY
export const GetJobSummary = controllerHandler(async (_req, res) => {
  const summary = await getJobSummary();
  if (!summary) return success(res, "Data tidak ditemukan", {}, 200);
  return success(res, "Berhasil mengambil ringkasan data", summary, 200);
});
