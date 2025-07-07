// src/utils/globalErrorHandler.js
import { error as errorResponse } from "./responseController.js";

export default function globalErrorHandler(err, _req, res, _next) {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message || "Unknown error occurred";

  return errorResponse(res, statusCode, message);
}
