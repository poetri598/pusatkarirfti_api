import { createStudentRoom, getStudentRoomAll, getStudentRoomById, updateStudentRoomById, deleteStudentRoomById, getFourLatestStudentRoom, searchFilterSortStudentRooms } from "../models/studentRoomModel.js";

import { bufferToBase64 } from "../utils/bufferToBase64.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// CREATE
export const CreateStudentRoom = controllerHandler(async (req, res) => {
  const payload = req.body;
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const student_room_img = req.file ? await bufferToBase64(req.file.buffer) : null;
  const result = await createStudentRoom({
    ...payload,
    student_room_img,
  });
  return success(res, "Berhasil menambahkan data", result, 201);
});

// READ ALL
export const GetStudentRoomAll = controllerHandler(async (_req, res) => {
  const rows = await getStudentRoomAll();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// READ BY ID
export const GetStudentRoomById = controllerHandler(async (req, res) => {
  const StudentRoom = await getStudentRoomById(req.params.student_room_id);
  if (!StudentRoom) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil mengambil data", StudentRoom, 200);
});

// UPDATE BY ID
export const UpdateStudentRoomById = controllerHandler(async (req, res) => {
  const { student_room_id } = req.params;
  const existing = await getStudentRoomById(student_room_id);
  if (!existing) return fail(res, "Data ID tidak ditemukan", 404);
  if (req.fileTypeError) return fail(res, req.fileTypeError, 415);
  const student_room_img = req.file ? await bufferToBase64(req.file.buffer) : existing.student_room_img;
  await updateStudentRoomById(student_room_id, {
    ...req.body,
    student_room_img,
  });
  return success(res, "Berhasil mengubah data", {}, 200);
});

// DELETE BY ID
export const DeleteStudentRoomById = controllerHandler(async (req, res) => {
  const result = await deleteStudentRoomById(req.params.student_room_id);
  if (result.affectedRows === 0) return fail(res, "Data ID tidak ditemukan", 404);
  return success(res, "Berhasil menghapus data", result, 200);
});

// ========================================================================================================================================================

// READ ALL
export const GetFourLatestStudentRoom = controllerHandler(async (_req, res) => {
  const rows = await getFourLatestStudentRoom();
  if (!rows.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", rows, 200);
});

// SEARCH FILTER SORT
export const SearchFilterSortStudentRooms = controllerHandler(async (req, res) => {
  const { search = "", sort = "" } = req.query;
  const filters = req.query;
  const result = await searchFilterSortStudentRooms({
    search,
    filters,
    sort,
  });
  if (!result.length) return success(res, "Data masih kosong", [], 200);
  return success(res, "Berhasil mengambil data", result, 200);
});
