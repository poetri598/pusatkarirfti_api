import { createCompany, getCompanyAll, getCompanyById, updateCompanyById, deleteCompanyById, getCompanyByName, getCompanyAllIsPartner, searchFilterSortCompanies } from "../models/companyModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateCompany = controllerHandler(async (req, res) => {
  const payload = req.body;
  const existing = await getCompanyByName(payload.company_name);
  if (payload.company_name === existing.company_name) return fail(res, "Data nama sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const company_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createCompany({
    ...payload,
    company_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetCompanyAll = controllerHandler(async (_req, res) => {
  const rows = await getCompanyAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetCompanyById = controllerHandler(async (req, res) => {
  const company = await getCompanyById(req.params.company_id);
  if (!company) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", company, 200);
});

// UPDATE BY ID
export const UpdateCompanyById = controllerHandler(async (req, res) => {
  const { company_id } = req.params;
  const existing = await getCompanyById(company_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const company_img = req.file ? await bufferToBase64(req.file.buffer) : existing.company_img;
  const company_name = req.body.company_name ?? existing.company_name;
  const duplicate = await getCompanyByName(existing.company_name);
  if (duplicate && duplicate.company_id !== Number(existing.company_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateCompanyById(company_id, {
    ...req.body,
    company_name,
    company_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteCompanyById = controllerHandler(async (req, res) => {
  const result = await deleteCompanyById(req.params.company_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ ALL
export const GetCompanyAllIsPartner = controllerHandler(async (_req, res) => {
  const rows = await getCompanyAllIsPartner();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortCompanies = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCompanies({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
