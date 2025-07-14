import db from "../configs/database.js";

// CREATE
export async function createUserWorkExperience(data) {
  const { user_id, company_id, position_id, user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, descriptions = [] } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const queryInsertExperience = `
      INSERT INTO tb_user_work_experiences (
        user_id, company_id, position_id, 
        user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valuesExperience = [user_id, company_id, position_id, user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current];
    const [res] = await connection.query(queryInsertExperience, valuesExperience);
    const experienceId = res.insertId;

    const queryInsertDescription = `
      INSERT INTO tb_user_work_experience_descriptions (
        user_work_experience_id, user_work_experience_description_name
      ) VALUES (?, ?)
    `;
    for (const desc of descriptions) {
      const valuesDesc = [experienceId, desc];
      await connection.query(queryInsertDescription, valuesDesc);
    }

    await connection.commit();
    return { user_work_experience_id: experienceId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getAllUserWorkExperiences() {
  const query = getUserWorkExperienceBaseQuery();
  const [rows] = await db.query(query);
  return rows;
}

// READ BY ID
export async function getUserWorkExperienceById(id) {
  const query = getUserWorkExperienceBaseQuery() + ` WHERE uwe.user_work_experience_id = ?`;
  const values = [id];
  const [rows] = await db.query(query, values);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserWorkExperienceById(id, data) {
  const { user_id, company_id, position_id, user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, descriptions = [] } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const queryUpdateExperience = `
      UPDATE tb_user_work_experiences SET 
        user_id = ?, company_id = ?, position_id = ?, 
        user_work_experience_start_date = ?, user_work_experience_end_date = ?, 
        user_work_experience_is_current = ?
      WHERE user_work_experience_id = ?
    `;
    const valuesUpdate = [user_id, company_id, position_id, user_work_experience_start_date, user_work_experience_end_date, user_work_experience_is_current, id];
    await connection.query(queryUpdateExperience, valuesUpdate);

    const queryDeleteDesc = `DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id = ?`;
    await connection.query(queryDeleteDesc, [id]);

    const queryInsertDesc = `
      INSERT INTO tb_user_work_experience_descriptions (
        user_work_experience_id, user_work_experience_description_name
      ) VALUES (?, ?)
    `;
    for (const desc of descriptions) {
      const valuesDesc = [id, desc];
      await connection.query(queryInsertDesc, valuesDesc);
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
export async function deleteUserWorkExperienceById(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const queryDeleteDesc = `DELETE FROM tb_user_work_experience_descriptions WHERE user_work_experience_id = ?`;
    await connection.query(queryDeleteDesc, [id]);
    const queryDeleteExperience = `DELETE FROM tb_user_work_experiences WHERE user_work_experience_id = ?`;
    await connection.query(queryDeleteExperience, [id]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// BASE QUERY
function getUserWorkExperienceBaseQuery() {
  return `
    SELECT 
      uwe.user_work_experience_id,
      uwe.user_id,
      u.user_fullname,
      uwe.company_id,
      c.company_name,
      uwe.position_id,
      p.position_name,
      uwe.user_work_experience_start_date,
      uwe.user_work_experience_end_date,
      uwe.user_work_experience_is_current,
      JSON_ARRAYAGG(uwd.user_work_experience_description_name) AS descriptions
    FROM tb_user_work_experiences uwe
    JOIN tb_users u ON uwe.user_id = u.user_id
    JOIN tb_companies c ON uwe.company_id = c.company_id
    JOIN tb_positions p ON uwe.position_id = p.position_id
    LEFT JOIN tb_user_work_experience_descriptions uwd ON uwe.user_work_experience_id = uwd.user_work_experience_id
    GROUP BY uwe.user_work_experience_id
  `;
}
