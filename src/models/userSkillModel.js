import db from "../configs/database.js";

// CREATE (Multiple Insert after Delete for user_id)
export async function createUserSkills({ user_id, skills }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Hapus semua data skill lama user tersebut
    await connection.query(`DELETE FROM tb_user_skills WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const skill of skills) {
      const { skill_id, skill_level_id } = skill;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_skills (
          user_id,
          skill_id,
          skill_level_id
        ) VALUES (?, ?, ?)
        `,
        [user_id, skill_id, skill_level_id]
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
export async function getUserSkillsAll() {
  const [rows] = await db.query(getSkillBaseQuery() + ` ORDER BY uskill.user_skill_id ASC`);
  return rows;
}

// READ BY ID
export async function getUserSkillById(user_skill_id) {
  const [rows] = await db.query(getSkillBaseQuery() + ` WHERE uskill.user_skill_id = ?`, [user_skill_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserSkillById(user_skill_id, skill) {
  const { user_id, skill_id, skill_level_id } = skill;

  const [result] = await db.query(
    `
    UPDATE tb_user_skills SET
      user_id = ?,
      skill_id = ?,
      skill_level_id = ?
    WHERE user_skill_id = ?
    `,
    [user_id, skill_id, skill_level_id, user_skill_id]
  );

  return result;
}

// DELETE BY ID
export async function deleteUserSkillById(user_skill_id) {
  const [result] = await db.query(`DELETE FROM tb_user_skills WHERE user_skill_id = ?`, [user_skill_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getSkillBaseQuery() {
  return `
    SELECT 
      uskill.user_skill_id,
      uskill.user_id,
      u.user_fullname,
      u.user_name,
      uskill.skill_id,
      s.skill_name,
      s.skill_desc,
      uskill.skill_level_id,
      sl.skill_level_name
    FROM tb_user_skills uskill
    LEFT JOIN tb_users u ON uskill.user_id = u.user_id
    LEFT JOIN tb_skills s ON uskill.skill_id = s.skill_id
    LEFT JOIN tb_skill_levels sl ON uskill.skill_level_id = sl.skill_level_id
  `;
}

// READ BY USERNAME
export async function getUserSkillsByUsername(username) {
  const [rows] = await db.query(getSkillBaseQuery() + ` HAVING u.user_name = ? ORDER BY uskill.user_skill_id DESC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserSkillsByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [result] = await connection.query(`DELETE FROM tb_user_skills WHERE user_id = ?`, [user_id]);

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
export async function updateUserSkillsByUsername(username, skills) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    // Hapus skill lama
    await connection.query(`DELETE FROM tb_user_skills WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const skill of skills) {
      const { skill_id, skill_level_id } = skill;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_skills (
          user_id,
          skill_id,
          skill_level_id
        ) VALUES (?, ?, ?)
        `,
        [user_id, skill_id, skill_level_id]
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
