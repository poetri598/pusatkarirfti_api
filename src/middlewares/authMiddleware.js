import jwt from "jsonwebtoken";
import { fail } from "../utils/responseController.js";

// Verifikasi access token
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return fail(res, "Unauthenticated", 401);
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, payload) => {
    if (err) return fail(res, "Token expired or invalid", 401);
    req.user = payload;
    next();
  });
}

// Cek role
export function authorize(...allowedRoleNames) {
  return (req, res, next) => {
    if (!req.user) return fail(res, "Unauthorized", 401);
    if (!allowedRoleNames.includes(req.user.role_name)) return fail(res, "Forbidden", 403);
    next();
  };
}

// Cek admin atau owner
export function ownerOrAdmin(req, res, next) {
  const isAdmin = req.user?.role_id === 1;
  const isOwner = req.user?.user_id === parseInt(req.params.id);
  if (isAdmin || isOwner) return next();
  return fail(res, "Forbidden", 403);
}
