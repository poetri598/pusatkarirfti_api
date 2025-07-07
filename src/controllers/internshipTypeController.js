import { createInternshipType, getInternshipTypeAll, getInternshipTypeById, updateInternshipTypeById, deleteInternshipTypeById, getInternshipTypeByName, searchFilterSortInternshipTypes } from "../models/internshipTypeModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateInternshipType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getInternshipTypeByName(payload.internship_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createInternshipType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetInternshipTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getInternshipTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetInternshipTypeById = controllerHandler(async (req, res) => {
  const InternshipType = await getInternshipTypeById(req.params.internship_type_id);
  if (!InternshipType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", InternshipType, 200);
});

// UPDATE BY ID
export const UpdateInternshipTypeById = controllerHandler(async (req, res) => {
  const { internship_type_id } = req.params;
  const existing = await getInternshipTypeById(internship_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const internship_type_name = req.body.internship_type_name ?? existing.internship_type_name;
  const duplicate = await getInternshipTypeByName(existing.internship_type_name);
  if (duplicate && duplicate.internship_type_id !== Number(existing.internship_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateInternshipTypeById(internship_type_id, {
    ...req.body,
    internship_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteInternshipTypeById = controllerHandler(async (req, res) => {
  const result = await deleteInternshipTypeById(req.params.internship_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortInternshipTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortInternshipTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
