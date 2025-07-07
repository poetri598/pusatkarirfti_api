import { createNewsType, getNewsTypeAll, getNewsTypeById, updateNewsTypeById, deleteNewsTypeById, getNewsTypeByName, searchFilterSortNewsTypes } from "../models/newsTypeModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateNewsType = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getNewsTypeByName(payload.news_type_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createNewsType({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetNewsTypeAll = controllerHandler(async (_req, res) => {
  const rows = await getNewsTypeAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetNewsTypeById = controllerHandler(async (req, res) => {
  const NewsType = await getNewsTypeById(req.params.news_type_id);
  if (!NewsType) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", NewsType, 200);
});

// UPDATE BY ID
export const UpdateNewsTypeById = controllerHandler(async (req, res) => {
  const { news_type_id } = req.params;
  const existing = await getNewsTypeById(news_type_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const news_type_name = req.body.news_type_name ?? existing.news_type_name;
  const duplicate = await getNewsTypeByName(existing.news_type_name);
  if (duplicate && duplicate.news_type_id !== Number(existing.news_type_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateNewsTypeById(news_type_id, {
    ...req.body,
    news_type_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteNewsTypeById = controllerHandler(async (req, res) => {
  const result = await deleteNewsTypeById(req.params.news_type_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortNewsTypes = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortNewsTypes({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
