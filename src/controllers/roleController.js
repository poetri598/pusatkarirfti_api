import { createRole, getRoleAll, getRoleById, updateRoleById, deleteRoleById, getRoleByName, searchFilterSortRoles } from "../models/roleModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateRole = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getRoleByName(payload.role_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createRole({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetRoleAll = controllerHandler(async (_req, res) => {
  const rows = await getRoleAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetRoleById = controllerHandler(async (req, res) => {
  const Role = await getRoleById(req.params.role_id);
  if (!Role) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Role, 200);
});

// UPDATE BY ID
export const UpdateRoleById = controllerHandler(async (req, res) => {
  const { role_id } = req.params;
  const existing = await getRoleById(role_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const role_name = req.body.role_name ?? existing.role_name;
  const duplicate = await getRoleByName(existing.role_name);
  if (duplicate && duplicate.role_id !== Number(existing.role_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateRoleById(role_id, {
    ...req.body,
    role_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteRoleById = controllerHandler(async (req, res) => {
  const result = await deleteRoleById(req.params.role_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortRoles = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortRoles({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
