import db from "../configs/database.js";

// CREATE
export async function createUserEducations({ user_id, educations }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Hapus semua data lama
    await connection.query(`DELETE FROM tb_user_educations WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const education of educations) {
      const { user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, program_study_id, education_id, company_id } = education;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_educations (
          user_education_admission_date,
          user_education_graduation_date,
          user_education_is_current,
          user_education_final_score,
          user_id,
          program_study_id,
          education_id,
          company_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, user_id, program_study_id, education_id, company_id]
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
export async function getUserEducationsAll() {
  const [rows] = await db.query(getEducationBaseQuery() + ` ORDER BY uedu.user_education_admission_date DESC`);
  return rows;
}

// READ BY ID
export async function getUserEducationById(user_education_id) {
  const [rows] = await db.query(getEducationBaseQuery() + ` WHERE uedu.user_education_id = ?`, [user_education_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserEducationById(user_education_id, education) {
  const { user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, user_id, program_study_id, education_id, company_id } = education;

  const [result] = await db.query(
    `
    UPDATE tb_user_educations SET
      user_education_admission_date = ?,
      user_education_graduation_date = ?,
      user_education_is_current = ?,
      user_education_final_score = ?,
      user_id = ?,
      program_study_id = ?,
      education_id = ?,
      company_id = ?
    WHERE user_education_id = ?
    `,
    [user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, user_id, program_study_id, education_id, company_id, user_education_id]
  );

  return result;
}

// DELETE BY ID
export async function deleteUserEducationById(user_education_id) {
  const [result] = await db.query(`DELETE FROM tb_user_educations WHERE user_education_id = ?`, [user_education_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getEducationBaseQuery() {
  return `
    SELECT 
      uedu.user_education_id,
      uedu.user_education_admission_date,
      uedu.user_education_graduation_date,
      uedu.user_education_is_current,
      uedu.user_education_final_score,
      uedu.user_id,
      u.user_fullname,
      u.user_name,
      uedu.program_study_id,
      ps.program_study_name,
      uedu.education_id,
      e.education_name,
      uedu.company_id,
      c.company_name,
      c.company_img
    FROM tb_user_educations uedu
    LEFT JOIN tb_users u ON uedu.user_id = u.user_id
    LEFT JOIN tb_program_studies ps ON uedu.program_study_id = ps.program_study_id
    LEFT JOIN tb_educations e ON uedu.education_id = e.education_id
    LEFT JOIN tb_companies c ON uedu.company_id = c.company_id
  `;
}

// READ BY USERNAME
export async function getUserEducationsByUsername(username) {
  const [rows] = await db.query(getEducationBaseQuery() + ` HAVING u.user_name = ? ORDER BY uedu.user_education_admission_date DESC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserEducationsByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [result] = await connection.query(`DELETE FROM tb_user_educations WHERE user_id = ?`, [user_id]);

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
export async function updateUserEducationsByUsername(username, educations) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    await connection.query(`DELETE FROM tb_user_educations WHERE user_id = ?`, [user_id]);

    const insertedIds = [];
    for (const education of educations) {
      const { user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, program_study_id, education_id, company_id } = education;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_educations (
          
          user_education_admission_date,
          user_education_graduation_date,
          user_education_is_current,
          user_education_final_score,
          user_id,
          program_study_id,
          education_id,
          company_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, user_id, program_study_id, education_id, company_id]
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
