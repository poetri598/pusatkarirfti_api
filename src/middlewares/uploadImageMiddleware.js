import multer from "multer";
import { fail } from "../utils/responseController.js";
import { uploadImage } from "../utils/uploadImage.js";

export const uploadImageMiddleware = (fieldName) => (req, res, next) => {
  uploadImage.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return fail(res, "Ukuran gambar melebihi 3 MB", 413);
      }
      return fail(res, err.message, 400);
    }
    next();
  });
};

// Untuk menangani FormData tanpa file (e.g. counseling)
export const uploadNoneMiddleware = uploadImage.none();
