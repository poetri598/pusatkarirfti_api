import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { getUserByUserName, getUserById } from "../models/userModel.js";
import { saveRefreshToken, deleteRefreshToken, findRefreshToken } from "../models/refreshTokenModel.js";
import { success, fail, error } from "../utils/responseController.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  path: "/",
};

// LOGIN
export async function Login(req, res) {
  const { user_name, user_password } = req.body;

  try {
    const user = await getUserByUserName(user_name);
    if (!user) return fail(res, "Anda belum terdaftar!", 401);

    const match = await bcrypt.compare(user_password, user.user_password);
    if (!match) return fail(res, "Password salah!", 401);

    if (user && user.status_id !== 1) return fail(res, "Akun Anda tidak aktif!", 401);

    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN }
    );

    const refreshToken = jwt.sign({ user_id: user.user_id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN });

    const decoded = jwt.decode(refreshToken);
    const expiresAt = dayjs().add(decoded.exp - decoded.iat, "second");
    await saveRefreshToken(user.user_id, refreshToken, expiresAt.format("YYYY-MM-DD HH:mm:ss"));

    const maxAge = (decoded.exp - decoded.iat) * 1000;
    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge,
      expires: new Date(Date.now() + maxAge),
    });

    const { user_password: _pw, ...sanitized } = user;
    return success(res, "Berhasil masuk", { access_token: accessToken, user: sanitized }, 200);
  } catch (err) {
    console.error("Login gagal:", err);
    return error(res, 500, err.message);
  }
}

// REFRESH TOKEN
export async function RefreshToken(req, res) {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) return fail(res, "Refresh token wajib diisi", 400);

  try {
    const stored = await findRefreshToken(refresh_token);
    if (!stored) return fail(res, "Refresh token tidak ditemukan", 401);

    jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN, async (err, payload) => {
      if (err) {
        await deleteRefreshToken(refresh_token);
        res.clearCookie("refresh_token", COOKIE_OPTIONS);
        return fail(res, "Refresh token tidak valid", 401);
      }

      const { user_id } = payload;
      const user = await getUserById(user_id);
      if (!user) {
        await deleteRefreshToken(refresh_token);
        return fail(res, "Pengguna tidak ditemukan", 404);
      }

      const newAccessToken = jwt.sign(
        {
          user_id: user.user_id,
          role_id: user.role_id,
          role_name: user.role_name,
        },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN }
      );

      const newRefreshToken = jwt.sign({ user_id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN });

      await deleteRefreshToken(refresh_token);

      const decoded = jwt.decode(newRefreshToken);
      const expiresAt = dayjs().add(decoded.exp - decoded.iat, "second");
      await saveRefreshToken(user_id, newRefreshToken, expiresAt.format("YYYY-MM-DD HH:mm:ss"));

      const maxAge = (decoded.exp - decoded.iat) * 1000;
      res.cookie("refresh_token", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge,
        expires: new Date(Date.now() + maxAge),
      });

      return success(res, "Berhasil memperbarui token", { access_token: newAccessToken });
    });
  } catch (err) {
    console.error("Error memperbarui token:", err);
    return error(res, 500, err.message);
  }
}

// LOGOUT
export async function Logout(req, res) {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) return fail(res, "Refresh token wajib diisi", 400);

  try {
    await deleteRefreshToken(refresh_token);
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/", // harus SAMA dengan saat login
    });
    return success(res, "Berhasil keluar", null, 200);
  } catch (err) {
    return error(res, 500, err.message);
  }
}
