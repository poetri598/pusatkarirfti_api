import db from "../configs/database.js";

// CREATE (Multiple Insert after Delete for user_id)
export async function createUserAchievements({ user_id, achievements }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Hapus semua data lama user tersebut
    await connection.query(`DELETE FROM tb_user_achievements WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const achievement of achievements) {
      const { user_achievement_name, user_achievement_date, company_id } = achievement;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_achievements (
          user_achievement_name,
          user_achievement_date,
          user_id,
          company_id
        ) VALUES (?, ?, ?, ?)
        `,
        [user_achievement_name, user_achievement_date, user_id, company_id]
      );

      insertedIds.push(res.insertId);
    }

    await connection.commit();
    return insertedIds;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getUserAchievementsAll() {
  const [rows] = await db.query(getAchievementBaseQuery() + ` ORDER BY uach.user_achievement_date DESC`);
  return rows;
}

// READ BY ID
export async function getUserAchievementById(user_achievement_id) {
  const [rows] = await db.query(getAchievementBaseQuery() + ` WHERE uach.user_achievement_id = ?`, [user_achievement_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserAchievementById(user_achievement_id, achievement) {
  const { user_achievement_name, user_achievement_date, user_id, company_id } = achievement;

  const [result] = await db.query(
    `
    UPDATE tb_user_achievements SET
      user_achievement_name = ?,
      user_achievement_date = ?,
      user_id = ?,
      company_id = ?
    WHERE user_achievement_id = ?
    `,
    [user_achievement_name, user_achievement_date, user_id, company_id, user_achievement_id]
  );

  return result;
}

// DELETE BY ID
export async function deleteUserAchievementById(user_achievement_id) {
  const [result] = await db.query(`DELETE FROM tb_user_achievements WHERE user_achievement_id = ?`, [user_achievement_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getAchievementBaseQuery() {
  return `
    SELECT 
      uach.user_achievement_id,
      uach.user_achievement_name,
      uach.user_achievement_date,
      uach.user_id,
      u.user_fullname,
      u.user_name,
      uach.company_id,
      c.company_name
    FROM tb_user_achievements uach
    LEFT JOIN tb_users u ON uach.user_id = u.user_id
    LEFT JOIN tb_companies c ON uach.company_id = c.company_id
  `;
}

// READ BY USERNAME
export async function getUserAchievementsByUsername(username) {
  const [rows] = await db.query(getAchievementBaseQuery() + ` HAVING u.user_name = ? ORDER BY uach.user_achievement_id ASC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserAchievementsByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [result] = await connection.query(`DELETE FROM tb_user_achievements WHERE user_id = ?`, [user_id]);

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE ALL BY USERNAME
export async function updateUserAchievementsByUsername(username, achievements) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    // Hapus data lama
    await connection.query(`DELETE FROM tb_user_achievements WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const achievement of achievements) {
      const { user_achievement_name, user_achievement_date, company_id } = achievement;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_achievements (
          user_achievement_name,
          user_achievement_date,
          user_id,
          company_id
        ) VALUES (?, ?, ?, ?)
        `,
        [user_achievement_name, user_achievement_date, user_id, company_id]
      );

      insertedIds.push(res.insertId);
    }

    await connection.commit();
    return { success: true, insertedIds };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
