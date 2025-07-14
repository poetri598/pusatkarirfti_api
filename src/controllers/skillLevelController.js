import { createSkillLevel, getSkillLevelAll, getSkillLevelById, updateSkillLevelById, deleteSkillLevelById, getSkillLevelByName, searchFilterSortSkillLevels } from "../models/skillLevelModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateSkillLevel = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getSkillLevelByName(payload.skill_level_name)) {
    return fail(res, "Data nama sudah tersedia", 409);
  }
  const result = await createSkillLevel(payload);
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetSkillLevelAll = controllerHandler(async (_req, res) => {
  const rows = await getSkillLevelAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetSkillLevelById = controllerHandler(async (req, res) => {
  const skill = await getSkillLevelById(req.params.skill_level_id);
  if (!skill) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", skill, 200);
});

// UPDATE BY ID
export const UpdateSkillLevelById = controllerHandler(async (req, res) => {
  const { skill_level_id } = req.params;
  const existing = await getSkillLevelById(skill_level_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);

  const skill_level_name = req.body.skill_level_name ?? existing.skill_level_name;
  const duplicate = await getSkillLevelByName(skill_level_name);
  if (duplicate && duplicate.skill_level_id !== Number(existing.skill_level_id)) {
    return fail(res, "Data nama sudah tersedia", 409);
  }

  await updateSkillLevelById(skill_level_id, {
    ...req.body,
    skill_level_name,
  });

  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteSkillLevelById = controllerHandler(async (req, res) => {
  const result = await deleteSkillLevelById(req.params.skill_level_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortSkillLevels = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortSkillLevels({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
