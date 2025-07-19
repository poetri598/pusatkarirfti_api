import db from "../configs/database.js";

// CREATE
export async function createUserOrganizationExperiences({ user_id, experiences }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const insertedIds = [];
    for (const experience of experiences) {
      const { user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, company_id, position_id, user_organization_experience_descriptions } = experience;
      const [res] = await connection.query(
        `
        INSERT INTO tb_user_organization_experiences (
          user_organization_experience_start_date,
          user_organization_experience_end_date,
          user_organization_experience_is_current,
          user_id,
          company_id,
          position_id
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, user_id, company_id, position_id]
      );
      const user_organization_experience_id = res.insertId;
      insertedIds.push(user_organization_experience_id);

      for (const description of user_organization_experience_descriptions) {
        await connection.query(
          `
          INSERT INTO tb_user_organization_experience_descriptions (
            user_organization_experience_description_name,
            user_organization_experience_id
          ) VALUES (?, ?)
          `,
          [description, user_organization_experience_id]
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
export async function getUserOrganizationExperiencesAll() {
  const [rows] = await db.query(getOrganizationExperienceBaseQuery() + ` ORDER BY uoe.user_organization_experience_start_date DESC`);
  return rows;
}

// READ BY ID
export async function getUserOrganizationExperienceById(user_organization_experience_id) {
  const [rows] = await db.query(getOrganizationExperienceBaseQuery() + ` WHERE uoe.user_organization_experience_id = ?`, [user_organization_experience_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserOrganizationExperienceById(user_organization_experience_id, experience) {
  const connection = await db.getConnection();
  const { user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, user_id, company_id, position_id, user_organization_experience_descriptions } = experience;

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE tb_user_organization_experiences SET
        user_organization_experience_start_date = ?,
        user_organization_experience_end_date = ?,
        user_organization_experience_is_current = ?,
        user_id = ?,
        company_id = ?,
        position_id = ?
      WHERE user_organization_experience_id = ?
      `,
      [user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, user_id, company_id, position_id, user_organization_experience_id]
    );

    await connection.query(`DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id = ?`, [user_organization_experience_id]);

    for (const description of user_organization_experience_descriptions) {
      await connection.query(
        `
        INSERT INTO tb_user_organization_experience_descriptions (
          user_organization_experience_description_name,
          user_organization_experience_id
        ) VALUES (?, ?)
        `,
        [description, user_organization_experience_id]
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
export async function deleteUserOrganizationExperienceById(user_organization_experience_id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id = ?`, [user_organization_experience_id]);
    const [result] = await connection.query(`DELETE FROM tb_user_organization_experiences WHERE user_organization_experience_id = ?`, [user_organization_experience_id]);

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
function getOrganizationExperienceBaseQuery() {
  return `
    SELECT 
      uoe.user_organization_experience_id,
      uoe.user_organization_experience_start_date,
      uoe.user_organization_experience_end_date,
      uoe.user_organization_experience_is_current,
      uoe.user_id,
      u.user_fullname,
      u.user_name,
      uoe.company_id,
      c.company_name,
      uoe.position_id,
      p.position_name,
      GROUP_CONCAT(descs.user_organization_experience_description_name SEPARATOR '@') AS user_organization_experience_descriptions
    FROM tb_user_organization_experiences uoe
    LEFT JOIN tb_users u ON uoe.user_id = u.user_id
    LEFT JOIN tb_companies c ON uoe.company_id = c.company_id
    LEFT JOIN tb_positions p ON uoe.position_id = p.position_id
    LEFT JOIN tb_user_organization_experience_descriptions descs ON uoe.user_organization_experience_id = descs.user_organization_experience_id
    GROUP BY uoe.user_organization_experience_id
  `;
}

// ========================================================================================================================================================

// READ BY USERNAME
export async function getUserOrganizationExperiencesByUsername(username) {
  const [rows] = await db.query(getOrganizationExperienceBaseQuery() + ` HAVING u.user_name = ? ORDER BY uoe.user_organization_experience_start_date DESC`, [username]);
  return rows;
}

// DELETE ALL BY USERNAME
export async function deleteUserOrganizationExperiencesByUsername(username) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [experiences] = await connection.query(`SELECT user_organization_experience_id FROM tb_user_organization_experiences WHERE user_id = ?`, [user_id]);
    const experienceIds = experiences.map((exp) => exp.user_organization_experience_id);

    if (experienceIds.length > 0) {
      await connection.query(`DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
      await connection.query(`DELETE FROM tb_user_organization_experiences WHERE user_organization_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
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
export async function updateUserOrganizationExperiencesByUsername(username, experiences) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(`SELECT user_id FROM tb_users WHERE user_name = ?`, [username]);
    if (!user) throw new Error("User tidak ditemukan");
    const user_id = user.user_id;

    const [existingExperiences] = await connection.query(`SELECT user_organization_experience_id FROM tb_user_organization_experiences WHERE user_id = ?`, [user_id]);
    const experienceIds = existingExperiences.map((exp) => exp.user_organization_experience_id);

    if (experienceIds.length > 0) {
      await connection.query(`DELETE FROM tb_user_organization_experience_descriptions WHERE user_organization_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
      await connection.query(`DELETE FROM tb_user_organization_experiences WHERE user_organization_experience_id IN (${experienceIds.map(() => "?").join(",")})`, experienceIds);
    }

    const insertedIds = [];
    for (const experience of experiences) {
      const { user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, company_id, position_id, user_organization_experience_descriptions } = experience;

      const [res] = await connection.query(
        `
        INSERT INTO tb_user_organization_experiences (
          user_organization_experience_start_date,
          user_organization_experience_end_date,
          user_organization_experience_is_current,
          user_id,
          company_id,
          position_id
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [user_organization_experience_start_date, user_organization_experience_end_date, user_organization_experience_is_current, user_id, company_id, position_id]
      );

      const user_organization_experience_id = res.insertId;
      insertedIds.push(user_organization_experience_id);

      for (const description of user_organization_experience_descriptions) {
        await connection.query(
          `
          INSERT INTO tb_user_organization_experience_descriptions (
            user_organization_experience_description_name,
            user_organization_experience_id
          ) VALUES (?, ?)
        `,
          [description, user_organization_experience_id]
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
