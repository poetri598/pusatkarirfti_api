import { createUserSkills, getUserSkillsAll, getUserSkillById, updateUserSkillById, deleteUserSkillById, getUserSkillsByUsername, deleteUserSkillsByUsername, updateUserSkillsByUsername } from "../models/userSkillModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserSkills = controllerHandler(async (req, res) => {
  const { user_id, skills } = req.body;

  if (!user_id || !skills) {
    return fail(res, "user_id dan skills diperlukan", 400);
  }

  let parsedSkills = skills;
  if (typeof skills === "string") {
    try {
      parsedSkills = JSON.parse(skills);
    } catch (err) {
      return fail(res, "Format skills tidak valid (harus JSON)", 400);
    }
  }

  const result = await createUserSkills({ user_id, skills: parsedSkills });
  return success(res, "Skill berhasil ditambahkan", result, 201);
});

// READ ALL
export const GetUserSkillsAll = controllerHandler(async (_req, res) => {
  const rows = await getUserSkillsAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserSkillById = controllerHandler(async (req, res) => {
  const { user_skill_id } = req.params;
  const skill = await getUserSkillById(user_skill_id);
  if (!skill) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", skill, 200);
});

// UPDATE BY ID
export const UpdateUserSkillById = controllerHandler(async (req, res) => {
  const { user_skill_id } = req.params;

  const existing = await getUserSkillById(user_skill_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);

  const payload = {
    user_id: req.body.user_id ?? existing.user_id,
    skill_id: req.body.skill_id ?? existing.skill_id,
    skill_level_id: req.body.skill_level_id ?? existing.skill_level_id,
  };

  await updateUserSkillById(user_skill_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserSkillById = controllerHandler(async (req, res) => {
  const { user_skill_id } = req.params;
  const result = await deleteUserSkillById(user_skill_id);

  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ===================================================================================================

// READ BY USERNAME
export const GetUserSkillsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const rows = await getUserSkillsByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data berdasarkan username", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserSkillsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const result = await deleteUserSkillsByUsername(username);
  return success(res, `Berhasil menghapus seluruh data skill berdasarkan username: ${username}`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserSkillsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { skills } = req.body;

  if (!username) return fail(res, "Parameter username diperlukan", 400);
  if (!skills) return fail(res, "Parameter skills diperlukan", 400);

  let parsedSkills = skills;
  if (typeof skills === "string") {
    try {
      parsedSkills = JSON.parse(skills);
    } catch (err) {
      return fail(res, "Format skills tidak valid (harus JSON)", 400);
    }
  }

  const result = await updateUserSkillsByUsername(username, parsedSkills);
  return success(res, `Berhasil memperbarui seluruh data skill untuk username: ${username}`, result, 200);
});
