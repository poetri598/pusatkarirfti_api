import db from "../configs/database.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// CREATE
export async function createUser(user) {
  const {
    user_img,
    user_fullname,
    user_name,
    user_nim,
    user_phone,
    user_email,
    user_password,
    user_birthdate,
    user_admission_date,
    user_graduation_date,
    age_id,
    weight_id,
    height_id,
    education_id,
    program_study_id,
    semester_id,
    ipk_id,
    city_id,
    gender_id,
    religion_id,
    marital_status_id,
    dream_position_id,
    dream_company_id,
    user_is_employed,
    current_company_id,
    current_position_id,
    role_id,
    status_id,
  } = user;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const hashedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
    const fields = [
      "user_fullname",
      "user_name",
      "user_nim",
      "user_phone",
      "user_email",
      "user_password",
      "user_birthdate",
      "user_admission_date",
      "user_graduation_date",
      "age_id",
      "weight_id",
      "height_id",
      "education_id",
      "program_study_id",
      "semester_id",
      "ipk_id",
      "city_id",
      "gender_id",
      "religion_id",
      "marital_status_id",
      "dream_position_id",
      "dream_company_id",
      "user_is_employed",
      "current_company_id",
      "current_position_id",
      "role_id",
      "status_id",
    ];
    const values = [
      user_fullname,
      user_name,
      user_nim,
      user_phone,
      user_email,
      hashedPassword,
      user_birthdate,
      user_admission_date,
      user_graduation_date,
      age_id,
      weight_id,
      height_id,
      education_id,
      program_study_id,
      semester_id,
      ipk_id,
      city_id,
      gender_id,
      religion_id,
      marital_status_id,
      dream_position_id,
      dream_company_id,
      user_is_employed,
      current_company_id,
      current_position_id,
      role_id,
      status_id,
    ];
    if (typeof user_img !== "undefined") {
      fields.unshift("user_img");
      values.unshift(user_img);
    }
    const placeholders = fields.map(() => "?").join(", ");
    const query = `INSERT INTO tb_users (${fields.join(", ")}) VALUES (${placeholders})`;
    const [res] = await connection.query(query, values);
    await connection.commit();
    return { user_id: res.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getUserAll() {
  const [rows] = await db.query(getUserBaseQuery() + ` ORDER BY user.user_id DESC`);
  return rows;
}

// READ BY ID
export async function getUserById(user_id) {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.user_id = ?`, [user_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateUserById(user_id, user) {
  const {
    user_img,
    user_fullname,
    user_name,
    user_nim,
    user_phone,
    user_email,
    user_password,
    user_birthdate,
    user_admission_date,
    user_graduation_date,
    age_id,
    weight_id,
    height_id,
    education_id,
    program_study_id,
    semester_id,
    ipk_id,
    city_id,
    gender_id,
    religion_id,
    marital_status_id,
    dream_position_id,
    dream_company_id,
    user_is_employed,
    current_company_id,
    current_position_id,
    role_id,
    status_id,
  } = user;
  const hashedPassword = user_password ? await bcrypt.hash(user_password, SALT_ROUNDS) : null;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_users SET
                          user_img            = ?,
                          user_fullname       = ?,
                          user_name           = ?,
                          user_nim            = ?,
                          user_phone          = ?,
                          user_email          = ?,
                          user_password       = COALESCE(?, user_password),
                          user_birthdate      = ?,
                          user_admission_date = ?,
                          user_graduation_date= ?,
                          age_id              = ?,
                          weight_id           = ?,
                          height_id           = ?,
                          education_id        = ?,
                          program_study_id    = ?,
                          semester_id         = ?,
                          ipk_id              = ?,
                          city_id             = ?,
                          gender_id           = ?,
                          religion_id         = ?,
                          marital_status_id   = ?,
                          dream_position_id   = ?,
                          dream_company_id    = ?,
                          user_is_employed         = ?,
                          current_position_id    = ?,
                          current_company_id     = ?,
                          role_id             = ?,
                          status_id           = ?
      WHERE user_id = ?
    `;
    const values = [
      user_img,
      user_fullname,
      user_name,
      user_nim,
      user_phone,
      user_email,
      hashedPassword,
      user_birthdate,
      user_admission_date,
      user_graduation_date,
      age_id,
      weight_id,
      height_id,
      education_id,
      program_study_id,
      semester_id,
      ipk_id,
      city_id,
      gender_id,
      religion_id,
      marital_status_id,
      dream_position_id,
      dream_company_id,
      user_is_employed,
      current_company_id,
      current_position_id,
      role_id,
      status_id,
      user_id,
    ];
    await connection.query(query, values);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE BY ID
export async function deleteUserById(user_id) {
  const [result] = await db.query(`DELETE FROM tb_users WHERE user_id = ?`, [user_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getUserBaseQuery() {
  return `
    SELECT
      user.user_id,
      user.user_img,
      user.user_fullname,
      user.user_name,
      user.user_nim,
      user.user_phone,
      user.user_email,
      user.user_password,
      user.user_birthdate,
      user.user_admission_date,
      user.user_graduation_date,
      user.user_created_at,
      user.user_updated_at,

      user.age_id,
      age.age_no,

      user.weight_id,
      weight.weight_no,

      user.height_id,
      height.height_no,

      user.education_id,
      education.education_name,

      user.program_study_id,
      program_study.program_study_name,

      user.semester_id,
      semester.semester_no,

      user.ipk_id,
      ipk.ipk_no,

      user.city_id,
      city.city_name,

      user.gender_id,
      gender.gender_name,

      user.religion_id,
      religion.religion_name,

      user.marital_status_id,
      marital_status.marital_status_name,

      user.dream_position_id,
      dream_position.position_name AS dream_position_name,

      user.dream_company_id,
      dream_company.company_name AS dream_company_name,
      dream_company.company_img AS dream_company_img,

      user.user_is_employed,

      user.current_position_id,
      current_position.position_name AS current_position_name,

      user.current_company_id,
      current_company.company_name AS current_company_name,
      current_company.company_img AS current_company_img,

      user.role_id,
      role.role_name,

      user.status_id,
      status.status_name

    FROM tb_users  user
    LEFT JOIN tb_ages age ON user.age_id = age.age_id
    LEFT JOIN tb_weights weight ON user.weight_id = weight.weight_id
    LEFT JOIN tb_heights height ON user.height_id = height.height_id
    LEFT JOIN tb_educations education ON user.education_id = education.education_id
    LEFT JOIN tb_program_studies program_study ON user.program_study_id = program_study.program_study_id
    LEFT JOIN tb_semesters semester ON user.semester_id = semester.semester_id
    LEFT JOIN tb_ipks ipk ON user.ipk_id = ipk.ipk_id
    LEFT JOIN tb_cities city ON user.city_id = city.city_id
    LEFT JOIN tb_genders gender ON user.gender_id = gender.gender_id
    LEFT JOIN tb_religions religion ON user.religion_id = religion.religion_id
    LEFT JOIN tb_marital_statuses marital_status ON user.marital_status_id = marital_status.marital_status_id
    LEFT JOIN tb_positions dream_position ON user.dream_position_id = dream_position.position_id
    LEFT JOIN tb_companies dream_company ON user.dream_company_id = dream_company.company_id
    LEFT JOIN tb_positions current_position ON user.current_position_id = current_position.position_id
    LEFT JOIN tb_companies current_company ON user.current_company_id = current_company.company_id
    LEFT JOIN tb_roles role ON user.role_id = role.role_id
    LEFT JOIN tb_statuses status ON user.status_id = status.status_id
  `;
}

//==============================================================================================================================================================

// READ BY USER_NAME
export async function getUserByUserName(user_name) {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.user_name = ?`, [user_name]);
  return rows[0];
}

// READ BY USER_EMAIL
export async function getUserByEmail(user_email) {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.user_email = ?`, [user_email]);
  return rows[0];
}

// READ BY USER_NIM
export async function getUserByNim(user_nim) {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.user_nim = ?`, [user_nim]);
  return rows[0];
}

// READ BY USER_PHONE
export async function getUserByPhone(user_phone) {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.user_phone = ?`, [user_phone]);
  return rows[0];
}

// READ PASSWORD BY USER_NAME
export async function getUserPasswordByUsername(user_name) {
  const [rows] = await db.query(`SELECT user_password FROM tb_users WHERE user_name = ? LIMIT 1`, [user_name]);
  return rows[0];
}
// READ ALL ADMIN
export async function getUserAllAdmin() {
  const [rows] = await db.query(getUserBaseQuery() + ` WHERE user.role_id = 1 ORDER BY user.user_id DESC`);
  return rows;
}

// UPDATE BY USER_NAME
export async function updateUserByUsername(user_name, user) {
  const {
    user_img,
    user_fullname,
    user_nim,
    user_phone,
    user_birthdate,
    user_admission_date,
    user_graduation_date,
    age_id,
    weight_id,
    height_id,
    education_id,
    program_study_id,
    semester_id,
    ipk_id,
    city_id,
    gender_id,
    religion_id,
    marital_status_id,
    dream_position_id,
    dream_company_id,
    user_is_employed,
    current_company_id,
    current_position_id,
    role_id,
    status_id,
  } = user;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_users SET
                          user_img            = ?,
                          user_fullname       = ?,
                          user_nim            = ?,
                          user_phone          = ?,
                          user_birthdate      = ?,
                          user_admission_date = ?,
                          user_graduation_date= ?,
                          age_id              = ?,
                          weight_id           = ?,
                          height_id           = ?,
                          education_id        = ?,
                          program_study_id    = ?,
                          semester_id         = ?,
                          ipk_id              = ?,
                          city_id             = ?,
                          gender_id           = ?,
                          religion_id         = ?,
                          marital_status_id   = ?,
                          dream_position_id   = ?,
                          dream_company_id    = ?,
                          user_is_employed         = ?,
                          current_position_id    = ?,
                          current_company_id     = ?,
                          role_id             = ?,
                          status_id           = ?
      WHERE user_name = ?
    `;
    const values = [
      user_img,
      user_fullname,
      user_nim,
      user_phone,
      user_birthdate,
      user_admission_date,
      user_graduation_date,
      age_id,
      weight_id,
      height_id,
      education_id,
      program_study_id,
      semester_id,
      ipk_id,
      city_id,
      gender_id,
      religion_id,
      marital_status_id,
      dream_position_id,
      dream_company_id,
      user_is_employed,
      current_company_id,
      current_position_id,
      role_id,
      status_id,
      user_name,
    ];
    await connection.query(query, values);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE USER_FULLNAME BY USER_NAME
export async function updateUserFullnameByUsername(user_name, user_fullname) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_users SET
        user_fullname = ?
      WHERE user_name = ?
    `;
    const values = [user_fullname, user_name];
    const [result] = await connection.query(query, values);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE USER_EMAIL BY USER_NAME
export async function updateUserEmailByUsername(user_name, user_email) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_users SET
        user_email = ?
      WHERE user_name = ?
    `;
    const values = [user_email.toLowerCase(), user_name];
    const [result] = await connection.query(query, values);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE USER_PASSWORD BY USER_NAME
export async function updateUserPasswordByUsername(user_name, user_password) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const hashedPassword = await bcrypt.hash(user_password, SALT_ROUNDS);
    const query = `
      UPDATE tb_users
      SET user_password = ?
      WHERE user_name = ?
    `;
    const values = [hashedPassword, user_name];
    const [result] = await connection.query(query, values);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE BY USER_NAME
export async function deleteUserByUsername(user_name) {
  const [result] = await db.query(`DELETE FROM tb_users WHERE user_name = ?`, [user_name]);
  return result;
}

// SEARCH FILTER SORT
export async function searchFilterSortUsers({ search = "", filters = {}, sort = "", limit = 10, offset = 0 }) {
  const baseQuery = getUserBaseQuery();

  const conditions = [];
  const values = [];

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY users.user_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY user.user_id ORDER BY user_created_at DESC`);
    return rows;
  }

  // Keyword Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      user.user_fullname LIKE ? OR 
      user.user_nim LIKE ? OR 
      user.user_phone LIKE ? OR 
      user.user_email LIKE ? OR
      age.age_no LIKE ? OR 
      weight.weight_no LIKE ? OR 
      height.height_no LIKE ? OR
      education.education_name LIKE ? OR 
      program_study.program_study_name LIKE ? OR 
      semester.semester_no LIKE ? OR
      ipk.ipk_no LIKE ? OR 
      city.city_name LIKE ? OR 
      gender.gender_name LIKE ? OR
      religion.religion_name LIKE ? OR 
      marital_status.marital_status_name LIKE ? OR
      dream_position.position_name LIKE ? OR 
      dream_company.company_name LIKE ? OR
      current_position.position_name LIKE ? OR 
      current_company.company_name LIKE ? OR
      role.role_name LIKE ?
    )`);
    values.push(...Array(20).fill(keyword));
  }

  // Date Filters
  const dateFilters = ["user_birthdate", "user_admission_date", "user_graduation_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`user.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  // Direct Filters
  const directFilters = [
    "age_id",
    "weight_id",
    "height_id",
    "education_id",
    "program_study_id",
    "semester_id",
    "ipk_id",
    "city_id",
    "gender_id",
    "religion_id",
    "marital_status_id",
    "dream_position_id",
    "dream_company_id",
    "user_is_employed",
    "current_position_id",
    "current_company_id",
    "role_id",
    "status_id",
  ];

  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`user.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const innerQuery = `${baseQuery} ${whereClause}`;
  const subquery = `SELECT * FROM (${innerQuery}) AS users`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [
      ...dateFilters,
      ...directFilters,
      "user_name",
      "user_fullname",
      "user_nim",
      "user_phone",
      "user_email",
      "user_created_at",
      "user_updated_at",
      "age_no",
      "weight_no",
      "height_no",
      "education_name",
      "program_study_name",
      "semester_no",
      "ipk_no",
      "city_name",
      "gender_name",
      "religion_name",
      "marital_status_name",
      "dream_position_name",
      "dream_company_name",
      "current_position_name",
      "current_company_name",
      "user_is_employed",
      "role_name",
      "status_name",
    ];

    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      orderBy = `ORDER BY users.${field} ${dir.toUpperCase()}`;
    }
  }

  const finalQuery = `${subquery} ${orderBy} LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  const [rows] = await db.query(finalQuery, values);
  return rows;
}
