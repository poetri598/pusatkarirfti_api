import db from "../configs/database.js";

// CREATE
export async function createUserWorkExperiences({ user_id, experiences }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertedIds = [];
    for (const experience of experiences) {
      const { user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, company_id, position_id, user_work_experience_descriptions } = experience;
      const [res] = await connection.query(
        `
        INSERT INTO tb_user_work_experiences (
          user_work_experience_start_date,
          user_work_experience_end_date,
          user_work_experience_is_current,
          user_id,
          company_id,
          position_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, user_id, company_id, position_id]
      );
      const user_work_experience_id = res.insertId;
      insertedIds.push(user_work_experience_id);
      for (const user_work_experience_description_name of user_work_experience_descriptions) {
        await connection.query(
          `
          INSERT INTO tb_user_work_experience_descriptions (
            user_work_experience_description_name,
            user_work_experience_id
          ) VALUES (?, ?)
        `,
          [user_work_experience_description_name, user_work_experience_id]
        );
      }
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
export async function getUserWorkExperiencesAll() {
  const [rows] = await db.query(getWorkExperienceBaseQuery() + ` ORDER BY uwe.user_work_experience_start_date DESC`);
  return rows;
}

// READ BY ID
export async function getUserWorkExperienceById(user_work_experience_id) {
  const [rows] = await db.query(getWorkExperienceBaseQuery() + ` WHERE uwe.user_work_experience_id = ?`, [user_work_experience_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserWorkExperienceById(user_work_experience_id, experience) {
  const connection = await db.getConnection();
  const { user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, user_id, company_id, position_id, user_work_experience_descriptions } = experience;

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE tb_user_work_experiences SET
        user_work_experience_start_date = ?,
        user_work_experience_end_date = ?,
        user_work_experience_is_current = ?,
        user_id = ?,
        company_id = ?,
        position_id = ?
      WHERE user_work_experience_id = ?
    `,
      [user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, user_id, company_id, position_id, user_work_experience_id]
    );

    await connection.query(`DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id = ?`, [user_work_experience_id]);

    for (const user_work_experience_description_name of user_work_experience_descriptions) {
      await connection.query(
        `
        INSERT INTO tb_user_work_experience_descriptions (
          user_work_experience_description_name,
          user_work_experience_id
        ) VALUES (?, ?)
      `,
        [user_work_experience_description_name, user_work_experience_id]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE BY ID
export async function deleteUserWorkExperienceById(user_work_experience_id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id = ?`, [user_work_experience_id]);
    const [result] = await connection.query(`DELETE FROM tb_user_work_experiences WHERE user_work_experience_id = ?`, [user_work_experience_id]);

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// COMMON SELECT FUNCTION
function getWorkExperienceBaseQuery() {
  return `
    SELECT 
      uwe.user_work_experience_id,
      uwe.user_work_experience_start_date,
      uwe.user_work_experience_end_date,
      uwe.user_work_experience_is_current,
      uwe.user_id,
      u.user_fullname,
      u.user_name,
      uwe.company_id,
      c.company_name,
      uwe.position_id,
      p.position_name,
      GROUP_CONCAT(descs.user_work_experience_description_name SEPARATOR '@') AS user_work_experience_descriptions
    FROM tb_user_work_experiences uwe
    LEFT JOIN tb_users u ON uwe.user_id = u.user_id
    LEFT JOIN tb_companies c ON uwe.company_id = c.company_id
    LEFT JOIN tb_positions p ON uwe.position_id = p.position_id
    LEFT JOIN tb_user_work_experience_descriptions descs ON uwe.user_work_experience_id = descs.user_work_experience_id
    GROUP BY uwe.user_work_experience_id
  `;
}

// ========================================================================================================================================================

// READ BY USERNAME
export async function getUserWorkExperiencesByUsername(username) {
  const [rows] = await db.query(getWorkExperienceBaseQuery() + ` HAVING u.user_name = ? ORDER BY uwe.user_work_experience_start_date DESC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserWorkExperiencesByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Ambil user_id berdasarkan username
    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;
    // Ambil semua ID pengalaman kerja dari user tersebut
    const [experiences] = await connection.query(`SELECT user_work_experience_id FROM tb_user_work_experiences WHERE user_id = ?`, [user_id]);
    const experienceIds = experiences.map((exp) => exp.user_work_experience_id);
    // Hapus semua deskripsi pengalaman kerja
    if (experienceIds.length > 0) {
      await connection.query(`DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
      // Hapus semua pengalaman kerja
      await connection.query(`DELETE FROM tb_user_work_experiences WHERE user_work_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
    }
    await connection.commit();
    return { success: true, deletedCount: experienceIds.length };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE ALL BY USERNAME
export async function updateUserWorkExperiencesByUsername(username, experiences) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Ambil user_id berdasarkan username
    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;
    // Ambil semua ID pengalaman kerja dari user tersebut
    const [existingExperiences] = await connection.query(`SELECT user_work_experience_id FROM tb_user_work_experiences WHERE user_id = ?`, [user_id]);
    const experienceIds = existingExperiences.map((exp) => exp.user_work_experience_id);
    // Hapus deskripsi pengalaman kerja terlebih dahulu
    if (experienceIds.length > 0) {
      await connection.query(`DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
      await connection.query(`DELETE FROM tb_user_work_experiences WHERE user_work_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
    }
    // Tambahkan pengalaman kerja baru
    const insertedIds = [];
    for (const experience of experiences) {
      const { user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, company_id, position_id, user_work_experience_descriptions } = experience;
      const [res] = await connection.query(
        `
        INSERT INTO tb_user_work_experiences (
          user_work_experience_start_date,
          user_work_experience_end_date,
          user_work_experience_is_current,
          user_id,
          company_id,
          position_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, user_id, company_id, position_id]
      );
      const user_work_experience_id = res.insertId;
      insertedIds.push(user_work_experience_id);
      for (const description_name of user_work_experience_descriptions) {
        await connection.query(
          `
          INSERT INTO tb_user_work_experience_descriptions (
            user_work_experience_description_name,
            user_work_experience_id
          ) VALUES (?, ?)
        `,
          [description_name, user_work_experience_id]
        );
      }
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
