import db from "../configs/database.js";

// CREATE (Multiple Insert after Delete for user_id)
export async function createUserPlatforms({ user_id, platforms }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Hapus semua data lama
    await connection.query(`DELETE FROM tb_user_platforms WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const platform of platforms) {
      const { user_platform_name, platform_id } = platform;

      const [res] = await connection.query(
        `INSERT INTO tb_user_platforms (
          user_platform_name,
          user_id,
          platform_id
        ) VALUES (?, ?, ?)`,
        [user_platform_name, user_id, platform_id]
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
export async function getUserPlatformsAll() {
  const [rows] = await db.query(getPlatformBaseQuery() + ` ORDER BY up.user_platform_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getUserPlatformById(user_platform_id) {
  const [rows] = await db.query(getPlatformBaseQuery() + ` WHERE up.user_platform_id = ?`, [user_platform_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserPlatformById(user_platform_id, data) {
  const { user_platform_name, user_id, platform_id } = data;

  const [result] = await db.query(
    `UPDATE tb_user_platforms SET
      user_platform_name = ?,
      user_id = ?,
      platform_id = ?
    WHERE user_platform_id = ?`,
    [user_platform_name, user_id, platform_id, user_platform_id]
  );

  return result;
}

// DELETE BY ID
export async function deleteUserPlatformById(user_platform_id) {
  const [result] = await db.query(`DELETE FROM tb_user_platforms WHERE user_platform_id = ?`, [user_platform_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getPlatformBaseQuery() {
  return `
    SELECT 
      up.user_platform_id,
      up.user_platform_name,
      up.user_id,
      u.user_fullname,
      u.user_name,
      up.platform_id,
      p.platform_name,
      p.platform_img
    FROM tb_user_platforms up
    LEFT JOIN tb_users u ON up.user_id = u.user_id
    LEFT JOIN tb_platforms p ON up.platform_id = p.platform_id
  `;
}

// READ BY USERNAME
export async function getUserPlatformsByUsername(username) {
  const [rows] = await db.query(getPlatformBaseQuery() + ` HAVING u.user_name = ? ORDER BY up.user_platform_created_at DESC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserPlatformsByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [result] = await connection.query(`DELETE FROM tb_user_platforms WHERE user_id = ?`, [user_id]);

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
export async function updateUserPlatformsByUsername(username, platforms) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    await connection.query(`DELETE FROM tb_user_platforms WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const platform of platforms) {
      const { user_platform_name, platform_id } = platform;

      const [res] = await connection.query(
        `INSERT INTO tb_user_platforms (
          user_platform_name,
          user_id,
          platform_id
        ) VALUES (?, ?, ?)`,
        [user_platform_name, user_id, platform_id]
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
