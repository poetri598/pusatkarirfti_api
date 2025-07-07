import { createIpk, getIpkAll, getIpkById, updateIpkById, deleteIpkById, getIpkByNo, searchFilterSortIpks } from "../models/ipkModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateIpk = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getIpkByName(payload.ipk_no)) return fail(res, "Data ipk sudah tersedia", 409);
  const result = await createIpk({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetIpkAll = controllerHandler(async (_req, res) => {
  const rows = await getIpkAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetIpkById = controllerHandler(async (req, res) => {
  const Ipk = await getIpkById(req.params.ipk_id);
  if (!Ipk) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Ipk, 200);
});

// UPDATE BY ID
export const UpdateIpkById = controllerHandler(async (req, res) => {
  const { ipk_id } = req.params;
  const existing = await getIpkById(ipk_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const ipk_no = req.body.ipk_no ?? existing.ipk_no;
  const duplicate = await getIpkByNo(existing.ipk_no);
  if (duplicate && duplicate.ipk_id !== Number(existing.ipk_id)) return fail(res, "Data ipk sudah tersedia", 409);
  await updateIpkById(ipk_id, {
    ...req.body,
    ipk_no,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteIpkById = controllerHandler(async (req, res) => {
  const result = await deleteIpkById(req.params.ipk_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortIpks = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortIpks({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
