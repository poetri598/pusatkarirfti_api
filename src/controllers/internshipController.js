import {
  createInternship,
  getInternshipAll,
  getInternshipById,
  updateInternshipById,
  deleteInternshipById,
  getInternshipBySlug,
  getThreeLatestInternship,
  getInternshipAllExceptSlug,
  incrementViewBySlug,
  searchFilterSortInternships,
  searchFilterSortInternshipsActive,
} from "../models/internshipModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { generateSlug } from "../utils/generateSlug.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateInternship = controllerHandler(async (req, res) => {
  const payload = req.body;
  const internship_slug = generateSlug(payload.internship_name);
  if (await getInternshipBySlug(internship_slug)) return fail(res, "Data judul sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const internship_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createInternship({
    ...payload,
    internship_slug,
    internship_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetInternshipAll = controllerHandler(async (_req, res) => {
  const rows = await getInternshipAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetInternshipById = controllerHandler(async (req, res) => {
  const internship = await getInternshipById(req.params.internship_id);
  if (!internship) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", internship, 200);
});

// UPDATE BY ID
export const UpdateInternshipById = controllerHandler(async (req, res) => {
  const { internship_id } = req.params;
  const existing = await getInternshipById(internship_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const internship_img = req.file ? await bufferToBase64(req.file.buffer) : existing.internship_img;
  const internship_name = req.body.internship_name ?? existing.internship_name;
  const internship_slug = generateSlug(internship_name);
  const duplicate = await getInternshipBySlug(internship_slug);
  if (duplicate && duplicate.internship_id !== Number(internship_id)) return fail(res, "Data judul sudah tersedia", 409);
  await updateInternshipById(internship_id, {
    ...req.body,
    internship_name,
    internship_slug,
    internship_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteInternshipById = controllerHandler(async (req, res) => {
  const result = await deleteInternshipById(req.params.internship_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ BY SLUG
export const GetInternshipBySlug = controllerHandler(async (req, res) => {
  const internship = await getInternshipBySlug(req.params.internship_slug);
  if (!internship) return fail(res, "Data judul tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", internship, 200);
});

// READ THREE LATEST
export const GetThreeLatestInternship = controllerHandler(async (_req, res) => {
  const rows = await getThreeLatestInternship();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Internship fetched successfully", rows, 200);
});

// READ ALL EXCEPT SLUG
export const GetInternshipAllExceptSlug = controllerHandler(async (req, res) => {
  const { internship_slug } = req.params;
  const rows = await getInternshipAllExceptSlug(internship_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// UPDATE VIEW
export const IncrementViewBySlug = controllerHandler(async (req, res) => {
  const { internship_slug } = req.params;
  const existing = await getInternshipBySlug(internship_slug);
  if (!existing) return fail(res, "Data judul tidak ditemukan", 404);
  await incrementViewBySlug(internship_slug);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortInternships = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortInternships({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// SEARCH FILTER SORT ACTIVE
export const SearchFilterSortInternshipsActive = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortInternshipsActive({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
