import bcrypt from "bcrypt";
import {
  createUser,
  getUserAll,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByUserName,
  getUserByEmail,
  getUserByNim,
  getUserByPhone,
  getUserPasswordByUsername,
  getUserAllAdmin,
  updateUserByUsername,
  updateUserEmailByUsername,
  updateUserPasswordByUsername,
  deleteUserByUsername,
  searchFilterSortUsers,
} from "../models/userModel.js";

import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { toNullableInt } from "../utils/toNullableInt.js";

// CREATE
export const CreateUser = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (await getUserByUserName(payload.user_name)) return fail(res, "Data username sudah tersedia", 409);
  if (await getUserByEmail(payload.user_email)) return fail(res, "Data email sudah tersedia", 409);
  if (await getUserByNim(payload.user_nim)) return fail(res, "Data NIM sudah tersedia", 409);
  if (await getUserByPhone(payload.user_phone)) return fail(res, "Data nomor handphone sudah tersedia", 409);
  if (payload.user_password !== payload.user_password_confirm) {
    return fail(res, "Konfirmasi password tidak cocok", 400);
  }
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const user_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const user_is_employed = Number(payload.user_is_employed ?? 0);
  const current_position_id = user_is_employed === 0 ? null : toNullableInt(payload.current_position_id);
  const current_company_id = user_is_employed === 0 ? null : toNullableInt(payload.current_company_id);

  const result = await createUser({
    ...payload,
    user_img,
    user_is_employed,
    current_position_id,
    current_company_id,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetUserAll = controllerHandler(async (_req, res) => {
  const rows = await getUserAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  const sanitizedUser = rows.map(sanitizeUser);
  return success(res, "Berhasil mengambil data", sanitizedUser, 200);
});

// READ BY ID
export const GetUserById = controllerHandler(async (req, res) => {
  const user = await getUserById(req.params.user_id);
  if (!user) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", sanitizeUser(user), 200);
});

// UPDATE BY ID
export const UpdateUserById = controllerHandler(async (req, res) => {
  const { user_id } = req.params;
  const existing = await getUserById(user_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const user_img = req.file ? await bufferToBase64(req.file.buffer) : existing.user_img;
  const user_email = req.body.user_email?.toLowerCase() ?? existing.user_email;
  const user_nim = req.body.user_nim ?? existing.user_nim;
  const user_phone = req.body.user_phone ?? existing.user_phone;
  const dupEmail = await getUserByEmail(user_email);
  if (dupEmail && dupEmail.user_id !== Number(existing.user_id)) return fail(res, "Data email sudah tersedia", 409);
  const dupNim = await getUserByNim(user_nim);
  if (dupNim && dupNim.user_id !== Number(existing.user_id)) return fail(res, "Data NIM sudah tersedia", 409);
  const dupPhone = await getUserByPhone(user_phone);
  if (dupPhone && dupPhone.user_id !== Number(existing.user_id)) return fail(res, "Data nomor handphone sudah tersedia", 409);
  const user_is_employed = Number(req.body.user_is_employed ?? existing.user_is_employed);
  const current_position_id = user_is_employed === 0 ? null : toNullableInt(req.body.current_position_id, existing.current_position_id);
  const current_company_id = user_is_employed === 0 ? null : toNullableInt(req.body.current_company_id, existing.current_company_id);
  await updateUserById(user_id, {
    ...req.body,
    user_img,
    user_email,
    user_nim,
    user_phone,
    user_is_employed,
    current_position_id,
    current_company_id,
  });
  const updated = await getUserById(user_id);
  return success(res, "Berhasil mengubah data", sanitizeUser(updated), 200);
});

// DELETE BY ID
export const DeleteUserById = controllerHandler(async (req, res) => {
  const result = await deleteUserById(req.params.user_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ BY USER_NAME
export const GetUserByUsername = controllerHandler(async (req, res) => {
  const user = await getUserByUserName(req.params.user_name);
  if (!user) return fail(res, "Data username tidak ditemukan", 404);
  const sanitizedUser = sanitizeUser(user);
  return success(res, "Berhasil mengambil data", sanitizedUser, 200);
});

// READ ALL ADMIN
export const GetUserAllAdmin = controllerHandler(async (_req, res) => {
  const rows = await getUserAllAdmin();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  const sanitizedUser = rows.map(sanitizeUser);
  return success(res, "Berhasil mengambil data", sanitizedUser, 200);
});

// UPDATE BY USER_NAME
export const UpdateUserByUsername = controllerHandler(async (req, res) => {
  const { user_name } = req.params;
  const existing = await getUserByUserName(user_name);
  if (!existing) return fail(res, "Data username tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const user_img = req.file ? await bufferToBase64(req.file.buffer) : existing.user_img;
  const user_email = req.body.user_email?.toLowerCase() ?? existing.user_email;
  const user_nim = req.body.user_nim ?? existing.user_nim;
  const user_phone = req.body.user_phone ?? existing.user_phone;
  const dupEmail = await getUserByEmail(user_email);
  if (dupEmail && dupEmail.user_id !== Number(existing.user_id)) return fail(res, "Data email sudah tersedia", 409);
  const dupNim = await getUserByNim(user_nim);
  if (dupNim && dupNim.user_id !== Number(existing.user_id)) return fail(res, "Data NIM sudah tersedia", 409);
  const dupPhone = await getUserByPhone(user_phone);
  if (dupPhone && dupPhone.user_id !== Number(existing.user_id)) return fail(res, "Data nomor handphone sudah tersedia", 409);
  const user_is_employed = Number(req.body.user_is_employed ?? existing.user_is_employed);
  const current_position_id = user_is_employed === 0 ? null : toNullableInt(req.body.current_position_id, existing.current_position_id);
  const current_company_id = user_is_employed === 0 ? null : toNullableInt(req.body.current_company_id, existing.current_company_id);
  await updateUserByUsername(user_name, {
    ...req.body,
    user_img,
    user_email,
    user_nim,
    user_phone,
    user_is_employed,
    current_position_id,
    current_company_id,
  });
  const updated = await getUserByUserName(user_name);
  return success(res, "Berhasil mengubah data", sanitizeUser(updated), 200);
});

// UPDATE EMAIL BY USER_NAME
export const UpdateUserEmailByUsername = controllerHandler(async (req, res) => {
  const { user_name } = req.params;
  const { user_email: rawEmail, user_password } = req.body;
  if (!user_password) return fail(res, "Password wajib diisi", 400);
  const existing = await getUserByUserName(user_name);
  if (!existing) return fail(res, "Data username tidak ditemukan", 404);
  const pwdRow = await getUserPasswordByUsername(user_name);
  const storedHash = pwdRow?.user_password;
  if (!storedHash) return fail(res, "Data password tidak ditemukan", 500);
  const isMatch = await bcrypt.compare(user_password, storedHash);
  if (!isMatch) return fail(res, "Data password anda salah", 401);
  const emailToUpdate = rawEmail?.toLowerCase() ?? existing.user_email;
  const dupEmail = await getUserByEmail(emailToUpdate);
  if (dupEmail && dupEmail.user_id !== Number(existing.user_id)) {
    return fail(res, "Data email sudah tersedia", 409);
  }
  await updateUserEmailByUsername(user_name, emailToUpdate);
  const updated = await getUserByUserName(user_name);
  return success(res, "Berhasil mengubah data", sanitizeUser(updated), 200);
});

// UPDATE PASSWORD BY USER_NAME
export const UpdateUserPasswordByUsername = controllerHandler(async (req, res) => {
  const { user_name } = req.params;
  const { user_password: rawPassword, user_password_confirm: rawConfirm } = req.body;
  const existing = await getUserByUserName(user_name);
  if (!existing) return fail(res, "Data username tidak ditemukan", 404);
  const passwordToUpdate = rawPassword ?? existing.user_password;
  const confirmToCheck = rawConfirm ?? null;
  if (!passwordToUpdate && !confirmToCheck) {
    return success(res, "Tidak ada perubahan data password", sanitizeUser(existing), 200);
  }
  if (!passwordToUpdate || !confirmToCheck) return fail(res, "Password dan konfirmasi wajib diisi", 400);
  if (passwordToUpdate !== confirmToCheck) return fail(res, "Konfirmasi password tidak cocok", 400);
  await updateUserPasswordByUsername(user_name, passwordToUpdate);
  const updated = await getUserByUserName(user_name);
  return success(res, "Berhasil mengubah data", sanitizeUser(updated), 200);
});

// DELETE BY USER_NAME
export const DeleteUserByUsername = controllerHandler(async (req, res) => {
  const result = await deleteUserByUsername(req.params.user_name);
  if (result.affectedRows === 0) return fail(res, "Data username tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortUsers = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortUsers({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
