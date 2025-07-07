import db from "../configs/database.js";

export async function saveRefreshToken(user_id, token, expiresAt) {
  const q = "INSERT INTO tb_refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)";
  await db.query(q, [user_id, token, expiresAt]);
}

export async function deleteRefreshToken(token) {
  await db.query("DELETE FROM tb_refresh_tokens WHERE token = ?", [token]);
}

export async function findRefreshToken(token) {
  const [rows] = await db.query("SELECT * FROM tb_refresh_tokens WHERE token = ?", [token]);
  return rows[0];
}
