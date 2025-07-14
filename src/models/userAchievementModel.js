import db from "../configs/database.js";

// CREATE
export async function createUserAchievement(data) {
  const { user_id, company_id, user_achievement_name, user_achievement_date } = data;

  const query = `
    INSERT INTO tb_user_achievements (
      user_id,
      company_id,
      user_achievement_name,
      user_achievement_date
    ) VALUES (?, ?, ?, ?)
  `;
  const values = [user_id, company_id, user_achievement_name, user_achievement_date];

  const [res] = await db.query(query, values);
  return { user_achievement_id: res.insertId };
}

// READ ALL
export async function getAllUserAchievements() {
  const query = getUserAchievementBaseQuery();
  const [rows] = await db.query(query);
  return rows;
}

// READ BY ID
export async function getUserAchievementById(id) {
  const query = getUserAchievementBaseQuery() + ` WHERE ua.user_achievement_id = ?`;
  const values = [id];
  const [rows] = await db.query(query, values);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserAchievementById(id, data) {
  const { user_id, company_id, user_achievement_name, user_achievement_date } = data;

  const query = `
    UPDATE tb_user_achievements SET
      user_id = ?,
      company_id = ?,
      user_achievement_name = ?,
      user_achievement_date = ?
    WHERE user_achievement_id = ?
  `;
  const values = [user_id, company_id, user_achievement_name, user_achievement_date, id];

  await db.query(query, values);
}

// DELETE BY ID
export async function deleteUserAchievementById(id) {
  const query = `DELETE FROM tb_user_achievements WHERE user_achievement_id = ?`;
  const values = [id];
  await db.query(query, values);
}

// BASE QUERY
function getUserAchievementBaseQuery() {
  return `
    SELECT
      ua.user_achievement_id,
      ua.user_id,
      u.user_fullname,
      ua.company_id,
      c.company_name,
      ua.user_achievement_name,
      ua.user_achievement_date
    FROM tb_user_achievements ua
    JOIN tb_users u ON ua.user_id = u.user_id
    JOIN tb_companies c ON ua.company_id = c.company_id
  `;
}
