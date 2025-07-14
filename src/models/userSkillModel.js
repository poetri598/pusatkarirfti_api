import db from "../configs/database.js";

// CREATE
export async function createUserSkill(data) {
  const { user_id, skill_id, skill_level_id } = data;

  const query = `
    INSERT INTO tb_user_skills (
      user_id, skill_id, skill_level_id
    ) VALUES (?, ?, ?)
  `;
  const values = [user_id, skill_id, skill_level_id];

  const [res] = await db.query(query, values);
  return { user_skill_id: res.insertId };
}

// READ ALL
export async function getAllUserSkills() {
  const query = getUserSkillBaseQuery();
  const [rows] = await db.query(query);
  return rows;
}

// READ BY ID
export async function getUserSkillById(id) {
  const query = getUserSkillBaseQuery() + ` WHERE us.user_skill_id = ?`;
  const values = [id];
  const [rows] = await db.query(query, values);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserSkillById(id, data) {
  const { user_id, skill_id, skill_level_id } = data;

  const query = `
    UPDATE tb_user_skills SET
      user_id = ?, skill_id = ?, skill_level_id = ?
    WHERE user_skill_id = ?
  `;
  const values = [user_id, skill_id, skill_level_id, id];

  await db.query(query, values);
}

// DELETE BY ID
export async function deleteUserSkillById(id) {
  const query = `DELETE FROM tb_user_skills WHERE user_skill_id = ?`;
  const values = [id];
  await db.query(query, values);
}

// BASE QUERY
function getUserSkillBaseQuery() {
  return `
    SELECT 
      us.user_skill_id,
      us.user_id,
      u.user_fullname,
      us.skill_id,
      s.skill_name,
      s.skill_desc,
      us.skill_level_id,
      sl.skill_level_name
    FROM tb_user_skills us
    JOIN tb_users u ON us.user_id = u.user_id
    JOIN tb_skills s ON us.skill_id = s.skill_id
    JOIN tb_skill_levels sl ON us.skill_level_id = sl.skill_level_id
  `;
}
