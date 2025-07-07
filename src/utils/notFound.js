import { fail } from "./responseController.js";

export default function notFound(req, res) {
  return fail(res, `Route ${req.originalUrl} not found`, 404);
}
