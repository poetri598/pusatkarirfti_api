import { createIndustry, getIndustryAll, getIndustryById, updateIndustryById, deleteIndustryById, getIndustryByName, searchFilterSortIndustries } from "../models/industryModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateIndustry = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getIndustryByName(payload.industry_name)) return fail(res, "Data nama sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const industry_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createIndustry({
    ...payload,
    industry_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetIndustryAll = controllerHandler(async (_req, res) => {
  const rows = await getIndustryAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetIndustryById = controllerHandler(async (req, res) => {
  const industry = await getIndustryById(req.params.industry_id);
  if (!industry) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", industry, 200);
});

// UPDATE BY ID
export const UpdateIndustryById = controllerHandler(async (req, res) => {
  const { industry_id } = req.params;
  const existing = await getIndustryById(industry_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const industry_name = req.body.industry_name ?? existing.industry_name;
  const duplicate = await getindustryByName(existing.industry_name);
  if (duplicate && duplicate.industry_id !== Number(existing.industry_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateIndustryById(industry_id, {
    ...req.body,
    industry_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteIndustryById = controllerHandler(async (req, res) => {
  const result = await deleteIndustryById(req.params.industry_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortIndustries = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortIndustries({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
