import multer from "multer";

const storage = multer.memoryStorage();
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  req.fileTypeError = "Tipe gambar harus .jpg, .jpeg, .png, atau .webp";
  cb(null, false); // file ditolak, req.file = undefined
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
