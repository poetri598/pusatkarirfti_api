import db from "../configs/database.js";

// CREATE
export async function createUserOrganizationExperience(data) {
  const { user_id, company_id, position_id, user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, descriptions = [] } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const queryInsertOrgExp = `
      INSERT INTO tb_user_organization_experiences (
        user_id, company_id, position_id,
        user_organization_experience_start_date,
        user_organization_experience_end_date,
        user_organization_experience_is_current
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valuesOrgExp = [user_id, company_id, position_id, user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current];
    const [res] = await connection.query(queryInsertOrgExp, valuesOrgExp);
    const experienceId = res.insertId;

    const queryInsertDesc = `
      INSERT INTO tb_user_organization_experience_descriptions (
        user_organization_experience_id,
        user_organization_experience_desc_name
      ) VALUES (?, ?)
    `;
    for (const desc of descriptions) {
      const valuesDesc = [experienceId, desc];
      await connection.query(queryInsertDesc, valuesDesc);
    }

    await connection.commit();
    return { user_organization_experience_id: experienceId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getAllUserOrganizationExperiences() {
  const query = getUserOrgExperienceBaseQuery();
  const [rows] = await db.query(query);
  return rows;
}

// READ BY ID
export async function getUserOrganizationExperienceById(id) {
  const query = getUserOrgExperienceBaseQuery() + ` WHERE uoe.user_organization_experience_id = ?`;
  const values = [id];
  const [rows] = await db.query(query, values);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserOrganizationExperienceById(id, data) {
  const { user_id, company_id, position_id, user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, descriptions = [] } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const queryUpdateExp = `
      UPDATE tb_user_organization_experiences SET
        user_id = ?, company_id = ?, position_id = ?,
        user_organization_experience_start_date = ?,
        user_organization_experience_end_date = ?,
        user_organization_experience_is_current = ?
      WHERE user_organization_experience_id = ?
    `;
    const valuesUpdate = [user_id, company_id, position_id, user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, id];
    await connection.query(queryUpdateExp, valuesUpdate);

    const queryDeleteDesc = `DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id = ?`;
    const valuesDelete = [id];
    await connection.query(queryDeleteDesc, valuesDelete);

    const queryInsertDesc = `
      INSERT INTO tb_user_organization_experience_descriptions (
        user_organization_experience_id,
        user_organization_experience_desc_name
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
export async function deleteUserOrganizationExperienceById(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const queryDeleteDesc = `DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id = ?`;
    const queryDeleteExp = `DELETE FROM tb_user_organization_experiences WHERE user_organization_experience_id = ?`;
    const values = [id];

    await connection.query(queryDeleteDesc, values);
    await connection.query(queryDeleteExp, values);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// BASE QUERY
function getUserOrgExperienceBaseQuery() {
  return `
    SELECT 
      uoe.user_organization_experience_id,
      uoe.user_id,
      u.user_fullname,
      uoe.company_id,
      c.company_name,
      uoe.position_id,
      p.position_name,
      uoe.user_organization_experience_start_date,
      uoe.user_organization_experience_end_date,
      uoe.user_organization_experience_is_current,
      JSON_ARRAYAGG(uoed.user_organization_experience_desc_name) AS descriptions
    FROM tb_user_organization_experiences uoe
    JOIN tb_users u ON uoe.user_id = u.user_id
    JOIN tb_companies c ON uoe.company_id = c.company_id
    JOIN tb_positions p ON uoe.position_id = p.position_id
    LEFT JOIN tb_user_organization_experience_descriptions uoed ON uoe.user_organization_experience_id = uoed.user_organization_experience_id
    GROUP BY uoe.user_organization_experience_id
  `;
}
