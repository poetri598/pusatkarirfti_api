import { getUserCVByUsername } from "../models/cvModel.js";
import { success, fail } from "../utils/responseController.js";
import { controllerHandler } from "../utils/controllerHandler.js";

// READ CV BY USERNAME
export const GetUserCVByUsername = controllerHandler(async (req, res) => {
  const { user_name } = req.params;
  if (!user_name) return fail(res, "Parameter user_name diperlukan", 400);

  const cv = await getUserCVByUsername(user_name);
  if (!cv) return fail(res, "CV tidak ditemukan untuk username tersebut", 404);

  return success(res, "Berhasil mengambil data CV", cv, 200);
});
