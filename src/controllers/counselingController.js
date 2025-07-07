import { createCounseling, getCounselingAll, getCounselingById, updateCounselingById, deleteCounselingById, getCounselingAllByUserId, searchFilterSortCounselings } from "../models/counselingModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import dayjs from "dayjs";

// CREATE
export const CreateCounseling = controllerHandler(async (req, res) => {
  const payload = req.body;
  const counselingDate = dayjs(payload.counseling_date);
  const now = dayjs();
  if (!counselingDate.isValid()) {
    return fail(res, "Data tanggal tidak valid", 400);
  }
  if (counselingDate.isBefore(now, "minute")) {
    return fail(res, "Data tanggal tidak boleh di masa lalu", 400);
  }
  const result = await createCounseling({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetCounselingAll = controllerHandler(async (_req, res) => {
  const rows = await getCounselingAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetCounselingById = controllerHandler(async (req, res) => {
  const Counseling = await getCounselingById(req.params.counseling_id);
  if (!Counseling) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Counseling, 200);
});

export const UpdateCounselingById = controllerHandler(async (req, res) => {
  const { counseling_id } = req.params;
  const existing = await getCounselingById(counseling_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const payload = { ...req.body };
  if (payload.counseling_date) {
    const counselingDate = dayjs(payload.counseling_date);
    const now = dayjs();
    if (!counselingDate.isValid()) {
      return fail(res, "Data Tanggal konseling tidak valid", 400);
    }
    if (counselingDate.isBefore(now, "minute")) {
      return fail(res, "Data tanggal tidak boleh di masa lalu", 400);
    }
  }
  await updateCounselingById(counseling_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteCounselingById = controllerHandler(async (req, res) => {
  const result = await deleteCounselingById(req.params.counseling_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ ALL
export const GetCounselingAllByUserId = controllerHandler(async (req, res) => {
  const rows = await getCounselingAllByUserId(req.params.user_id);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortCounselings = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortCounselings({ search, filters, sort });
  if (!result.length) return success(res, "Data pencarian masih kosong", [], 200);
  return success(res, "Berhasil mengambil data ", result, 200);
});
