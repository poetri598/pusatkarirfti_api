import db from "../configs/database.js";

// CREATE
export async function createUserEducation(data) {
  const { user_id, education_id, user_education_name, user_education_subject, user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score } = data;

  const query = `
    INSERT INTO tb_user_educations (
      user_id,
      education_id,
      user_education_name,
      user_education_subject,
      user_education_admission_date,
      user_education_graduation_date,
      user_education_is_current,
      user_education_final_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [user_id, education_id, user_education_name, user_education_subject, user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score];

  const [res] = await db.query(query, values);
  return { user_education_id: res.insertId };
}

// READ ALL
export async function getAllUserEducations() {
  const query = getUserEducationBaseQuery();
  const [rows] = await db.query(query);
  return rows;
}

// READ BY ID
export async function getUserEducationById(id) {
  const query = getUserEducationBaseQuery() + ` WHERE ue.user_education_id = ?`;
  const values = [id];
  const [rows] = await db.query(query, values);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserEducationById(id, data) {
  const { user_id, education_id, user_education_name, user_education_subject, user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score } = data;

  const query = `
    UPDATE tb_user_educations SET
      user_id = ?,
      education_id = ?,
      user_education_name = ?,
      user_education_subject = ?,
      user_education_admission_date = ?,
      user_education_graduation_date = ?,
      user_education_is_current = ?,
      user_education_final_score = ?
    WHERE user_education_id = ?
  `;

  const values = [user_id, education_id, user_education_name, user_education_subject, user_education_admission_date, user_education_graduation_date, user_education_is_current, user_education_final_score, id];

  await db.query(query, values);
}

// DELETE BY ID
export async function deleteUserEducationById(id) {
  const query = `DELETE FROM tb_user_educations WHERE user_education_id = ?`;
  const values = [id];
  const [res] = await db.query(query, values);
  return res;
}

// BASE QUERY
function getUserEducationBaseQuery() {
  return `
    SELECT 
      ue.user_education_id,
      ue.user_id,
      u.user_fullname,
      ue.education_id,
      e.education_name,
      ue.user_education_name,
      ue.user_education_subject,
      ue.user_education_admission_date,
      ue.user_education_graduation_date,
      ue.user_education_is_current,
      ue.user_education_final_score
    FROM tb_user_educations ue
    JOIN tb_users u ON ue.user_id = u.user_id
    JOIN tb_educations e ON ue.education_id = e.education_id
  `;
}
