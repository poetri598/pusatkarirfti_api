import {
  createUserPlatforms,
  getUserPlatformsAll,
  getUserPlatformById,
  updateUserPlatformById,
  deleteUserPlatformById,
  getUserPlatformsByUsername,
  deleteUserPlatformsByUsername,
  updateUserPlatformsByUsername,
} from "../models/userPlatformModel.js";

import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateUserPlatforms = controllerHandler(async (req, res) => {
  const { user_id, platforms } = req.body;

  if (!user_id || !platforms) {
    return fail(res, "user_id dan platforms diperlukan", 400);
  }

  let parsedPlatforms = platforms;
  if (typeof platforms === "string") {
    try {
      parsedPlatforms = JSON.parse(platforms);
    } catch (err) {
      return fail(res, "Format platforms tidak valid (harus JSON)", 400);
    }
  }

  const result = await createUserPlatforms({ user_id, platforms: parsedPlatforms });
  return success(res, "Akun sosial media berhasil ditambahkan", result, 201);
});

// READ ALL
export const GetUserPlatformsAll = controllerHandler(async (_req, res) => {
  const rows = await getUserPlatformsAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetUserPlatformById = controllerHandler(async (req, res) => {
  const { user_platform_id } = req.params;
  const platform = await getUserPlatformById(user_platform_id);
  if (!platform) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", platform, 200);
});

// UPDATE BY ID
export const UpdateUserPlatformById = controllerHandler(async (req, res) => {
  const { user_platform_id } = req.params;

  const existing = await getUserPlatformById(user_platform_id);
  if (!existing) return fail(res, "Data tidak ditemukan", 404);

  const payload = {
    user_platform_name: req.body.user_platform_name ?? existing.user_platform_name,
    user_id: req.body.user_id ?? existing.user_id,
    platform_id: req.body.platform_id ?? existing.platform_id,
  };

  await updateUserPlatformById(user_platform_id, payload);
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteUserPlatformById = controllerHandler(async (req, res) => {
  const { user_platform_id } = req.params;
  const result = await deleteUserPlatformById(user_platform_id);

  if (result.affectedRows === 0) return fail(res, "Data tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================

// READ BY USERNAME
export const GetUserPlatformsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const rows = await getUserPlatformsByUsername(username);
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data berdasarkan username", rows, 200);
});

// DELETE BY USERNAME
export const DeleteUserPlatformsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, "Parameter username diperlukan", 400);

  const result = await deleteUserPlatformsByUsername(username);
  return success(res, `Berhasil menghapus seluruh akun sosial media berdasarkan username: ${username}`, result, 200);
});

// UPDATE BY USERNAME
export const UpdateUserPlatformsByUsername = controllerHandler(async (req, res) => {
  const { username } = req.params;
  const { platforms } = req.body;

  if (!username) return fail(res, "Parameter username diperlukan", 400);
  if (!platforms) return fail(res, "Parameter platforms diperlukan", 400);

  let parsedPlatforms = platforms;
  if (typeof platforms === "string") {
    try {
      parsedPlatforms = JSON.parse(platforms);
    } catch (err) {
      return fail(res, "Format platforms tidak valid (harus JSON)", 400);
    }
  }

  const result = await updateUserPlatformsByUsername(username, parsedPlatforms);
  return success(res, `Berhasil memperbarui seluruh akun sosial media untuk username: ${username}`, result, 200);
});
