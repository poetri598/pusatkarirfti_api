import { createProfilCdcFti, getProfilCdcFtiAll, getProfilCdcFtiById, updateProfilCdcFtiById, deleteProfilCdcFtiById, searchFilterSortProfilCdcFti } from "../models/profilCdcFtiModel.js";

import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateProfilCdcFti = controllerHandler(async (req, res) => {
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const imageFields = ["profil_cdc_fti_img", "profil_cdc_fti_vision_img", "profil_cdc_fti_mission_img", "profil_cdc_fti_goal_img", "profil_cdc_fti_benefit_img"];
  const imageData = {};
  for (const field of imageFields) {
    imageData[field] = req.files?.[field]?.[0] ? await bufferToBase64(req.files[field][0].buffer) : null;
  }
  const payload = {
    ...req.body,
    ...imageData,
  };
  const result = await createProfilCdcFti(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetProfilCdcFtiAll = controllerHandler(async (_req, res) => {
  const rows = await getProfilCdcFtiAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetProfilCdcFtiById = controllerHandler(async (req, res) => {
  const { profil_cdc_fti_id } = req.params;
  const data = await getProfilCdcFtiById(profil_cdc_fti_id);
  if (!data) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", data, 200);
});

// UPDATE BY ID
export const UpdateProfilCdcFtiById = controllerHandler(async (req, res) => {
  const { profil_cdc_fti_id } = req.params;
  const existing = await getProfilCdcFtiById(profil_cdc_fti_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const imageFields = ["profil_cdc_fti_img", "profil_cdc_fti_vision_img", "profil_cdc_fti_mission_img", "profil_cdc_fti_goal_img", "profil_cdc_fti_benefit_img"];
  const imageData = {};
  for (const field of imageFields) {
    imageData[field] = req.files?.[field]?.[0] ? await bufferToBase64(req.files[field][0].buffer) : existing[field];
  }
  const payload = {
    ...existing,
    ...req.body,
    ...imageData,
  };
  await updateProfilCdcFtiById(profil_cdc_fti_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteProfilCdcFtiById = controllerHandler(async (req, res) => {
  const result = await deleteProfilCdcFtiById(req.params.profil_cdc_fti_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

//==============================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortProfilCdcFti = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortProfilCdcFti({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
