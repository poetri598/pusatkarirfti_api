import { createActivity, getActivityAll, getActivityById, updateActivityById, deleteActivityById, getActivityByName, searchFilterSortActivities } from "../models/activityModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateActivity = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getActivityByName(payload.activity_name)) return fail(res, "Data nama sudah tersedia", 409);
  const result = await createActivity({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetActivityAll = controllerHandler(async (_req, res) => {
  const rows = await getActivityAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetActivityById = controllerHandler(async (req, res) => {
  const activity = await getActivityById(req.params.activity_id);
  if (!activity) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", a, 200);
});

// UPDATE BY ID
export const UpdateActivityById = controllerHandler(async (req, res) => {
  const { activity_id } = req.params;
  const existing = await getActivityById(activity_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const activity_name = req.body.activity_name ?? existing.activity_name;
  const duplicate = await getActivityByName(existing.activity_name);
  if (duplicate && duplicate.activity_id !== Number(existing.activity_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateActivityById(activity_id, {
    ...req.body,
    activity_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteActivityById = controllerHandler(async (req, res) => {
  const result = await deleteActivityById(req.params.activity_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortActivities = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortActivities({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
