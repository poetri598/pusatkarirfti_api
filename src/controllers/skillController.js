import { createSkill, getSkillAll, getSkillById, updateSkillById, deleteSkillById, getSkillByName, searchFilterSortSkills } from "../models/skillModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateSkill = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getSkillByName(payload.skill_name)) return fail(res, "data nama sudah tersedia", 409);
  const result = await createSkill({
    ...payload,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetSkillAll = controllerHandler(async (_req, res) => {
  const rows = await getSkillAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetSkillById = controllerHandler(async (req, res) => {
  const Skill = await getSkillById(req.params.skill_id);
  if (!Skill) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", Skill, 200);
});

// UPDATE
export const UpdateSkillById = controllerHandler(async (req, res) => {
  const { skill_id } = req.params;
  const existing = await getSkillById(skill_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  const skill_name = req.body.skill_name ?? existing.skill_name;
  const duplicate = await getSkillByName(existing.skill_name);
  if (duplicate && duplicate.skill_id !== Number(existing.skill_id)) return fail(res, "Data nama sudah tersedia", 409);
  await updateSkillById(skill_id, {
    ...req.body,
    skill_name,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE
export const DeleteSkillById = controllerHandler(async (req, res) => {
  const result = await deleteSkillById(req.params.skill_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// SEARCH FILTER SORT
export const SearchFilterSortSkills = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortSkills({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
