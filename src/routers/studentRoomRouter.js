import express from "express";
import { CreateStudentRoom, GetStudentRoomAll, GetStudentRoomById, UpdateStudentRoomById, DeleteStudentRoomById, GetFourLatestStudentRoom, SearchFilterSortStudentRooms } from "../controllers/studentRoomController.js";

import { authenticate, ownerOrAdmin, authorize } from "../middlewares/authMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

// CREATE
router.post("/student-rooms", uploadImageMiddleware("student_room_img"), CreateStudentRoom);

// READ
router.get("/student-rooms", GetStudentRoomAll);
router.get("/student-rooms/search", SearchFilterSortStudentRooms);
router.get("/student-rooms/four-latest", GetFourLatestStudentRoom);
router.get("/student-rooms/:student_room_id", GetStudentRoomById);

// UPDATE
router.put("/student-rooms/:student_room_id", uploadImageMiddleware("student_room_img"), UpdateStudentRoomById);

// DELETE
router.delete("/student-rooms/:student_room_id", DeleteStudentRoomById);

export default router;
