import {
  createNews,
  getNewsAll,
  getNewsById,
  updateNewsById,
  deleteNewsById,
  getNewsBySlug,
  getThreeLatestNews,
  getNewsAllExceptSlug,
  getOneMostPopularNews,
  incrementViewBySlug,
  getNewsAllByTypeNameKegiatanPusatKarirFTI,
  getNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug,
  searchFilterSortNews,
  searchFilterSortNewsActive,
  getSummary,
} from "../models/newsModel.js";
import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { generateSlug } from "../utils/generateSlug.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import { cleanTags } from "../utils/cleanTags.js";

// CREATE
export const CreateNews = controllerHandler(async (req, res) => {
  const payload = req.body;
  const news_slug = generateSlug(payload.news_name);
  if (await getNewsBySlug(news_slug)) return fail(res, "Data judul sudah tersedia", 409);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const news_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const news_tags = cleanTags(payload.news_tags);
  const result = await createNews({
    ...payload,
    news_slug,
    news_img,
    news_tags,
  });
  return success(res, "News created successfully", result, 201);
});

// READ ALL
export const GetNewsAll = controllerHandler(async (_req, res) => {
  const rows = await getNewsAll();
  if (!rows.length) return success(res, "Data masih kososng", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetNewsById = controllerHandler(async (req, res) => {
  const news = await getNewsById(req.params.news_id);
  if (!news) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "News fetched successfully", news, 200);
});

// UPDATE BY ID
export const UpdateNewsById = controllerHandler(async (req, res) => {
  const { news_id } = req.params;
  const existing = await getNewsById(news_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const news_img = req.file ? await bufferToBase64(req.file.buffer) : existing.news_img;
  const news_name = req.body.news_name ?? existing.news_name;
  const news_slug = generateSlug(news_name);
  const duplicate = await getNewsBySlug(news_slug);
  if (duplicate && duplicate.news_id !== Number(news_id)) return fail(res, "Data judul sudah tersedia", 409);
  const rawTags = req.body.news_tags ?? existing.news_tags;
  const news_tags = cleanTags(rawTags);
  await updateNewsById(news_id, {
    ...req.body,
    news_name,
    news_slug,
    news_img,
    news_tags,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteNewsById = controllerHandler(async (req, res) => {
  const result = await deleteNewsById(req.params.news_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

//==============================================================================================================================================================

// READ BY SLUG
export const GetNewsBySlug = controllerHandler(async (req, res) => {
  const news = await getNewsBySlug(req.params.news_slug);
  if (!news) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", news, 200);
});

// READ THREE LATEST
export const GetThreeLatestNews = controllerHandler(async (_req, res) => {
  const rows = await getThreeLatestNews();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ALL EXCEPT SLUG
export const GetNewsAllExceptSlug = controllerHandler(async (req, res) => {
  const { news_slug } = req.params;
  const rows = await getNewsAllExceptSlug(news_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ONE MOST POPULAR
export const GetOneMostPopularNews = controllerHandler(async (_req, res) => {
  const news = await getOneMostPopularNews();
  if (!news) return success(res, "Data masih kosong", null, 200);
  return success(res, "Berhasil mengambil data", news, 200);
});

// UPDATE VIEW
export const IncrementViewBySlug = controllerHandler(async (req, res) => {
  const { news_slug } = req.params;
  const existing = await getNewsBySlug(news_slug);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  await incrementViewBySlug(news_slug);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// READ ALL BY TYPE NAME KEGIATAN PUSAT KARIR FTI
export const GetNewsAllByTypeNameKegiatanPusatKarirFTI = controllerHandler(async (_req, res) => {
  const rows = await getNewsAllByTypeNameKegiatanPusatKarirFTI();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ ALL BY TYPE NAME KEGIATAN PUSAT KARIR FTI
export const GetNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug = controllerHandler(async (req, res) => {
  const { news_slug } = req.params;
  const rows = await getNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug(news_slug);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortNews = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortNews({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// SEARCH FILTER SORT ACTIVE
export const SearchFilterSortNewsActive = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortNewsActive({ search, filters, sort });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});

// GET SUMMARY
export const GetSummary = controllerHandler(async (_req, res) => {
  const summary = await getSummary();
  if (!summary) return success(res, "Data tidak ditemukan", {}, 200);
  return success(res, "Berhasil mengambil ringkasan data", summary, 200);
});
