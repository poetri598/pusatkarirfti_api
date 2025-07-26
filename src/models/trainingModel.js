import db from "../configs/database.js";
import { allowedPivotTables } from "../utils/pivotTables.js";

// Refresh pivot tables
async function refreshPivot(conn, table, column, training_id, ids = [], entity = "trainings") {
  const allowedTablesForEntity = allowedPivotTables[entity] || [];
  if (!allowedTablesForEntity.includes(table)) {
    throw new Error(`"${table}" pada "${entity}" tidak ditemukan`);
  }
  if (!Array.isArray(ids)) {
    ids = typeof ids === "string" ? ids.split(",").map((v) => Number(v.trim())) : [];
  }
  await conn.query(`DELETE FROM ?? WHERE training_id = ?`, [table, training_id]);
  if (ids.length) {
    const rows = ids.map((v) => [training_id, v]);
    await conn.query(`INSERT INTO ?? (training_id, ??) VALUES ?`, [table, column, rows]);
  }
}

// CREATE
export async function createTraining(training) {
  const connection = await db.getConnection();
  const {
    training_img,
    training_name,
    training_slug,
    training_desc,
    training_price,
    training_location,
    training_link,
    training_date,
    training_open_date,
    training_close_date,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    mode_ids = [],
    program_study_ids = [],
    province_ids = [],
    semester_ids = [],
    skill_ids = [],
    training_type_ids = [],
  } = training;
  try {
    await connection.beginTransaction();
    const query = `
                    INSERT INTO tb_trainings (
                                                training_img, 
                                                training_name, 
                                                training_slug, 
                                                training_desc, 
                                                training_price, 
                                                training_location, 
                                                training_link, 
                                                training_date, 
                                                training_open_date, 
                                                training_close_date, 
                                                company_id, 
                                                user_id,
                                                status_id
                                              )  
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    const values = [training_img, training_name, training_slug, training_desc, training_price, training_location, training_link, training_date, training_open_date, training_close_date, company_id, user_id, status_id];
    const [res] = await connection.query(query, values);
    const training_id = res.insertId;
    await Promise.all([
      refreshPivot(connection, "tb_trainings_cities", "city_id", training_id, city_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_countries", "country_id", training_id, country_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_educations", "education_id", training_id, education_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_modes", "mode_id", training_id, mode_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_program_studies", "program_study_id", training_id, program_study_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_provinces", "province_id", training_id, province_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_semesters", "semester_id", training_id, semester_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_skills", "skill_id", training_id, skill_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_training_types", "training_type_id", training_id, training_type_ids, "trainings"),
    ]);
    await connection.commit();
    return { training_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getTrainingAll() {
  const [rows] = await db.query(getTrainingBaseQuery() + ` WHERE status.status_id = 1 GROUP BY training.training_id ORDER BY training.training_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getTrainingById(training_id) {
  const [rows] = await db.query(getTrainingBaseQuery() + ` WHERE training.training_id = ? GROUP BY training.training_id`, [training_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateTrainingById(training_id, training) {
  const connection = await db.getConnection();
  const {
    training_img,
    training_name,
    training_slug,
    training_desc,
    training_price,
    training_location,
    training_link,
    training_date,
    training_open_date,
    training_close_date,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    mode_ids = [],
    program_study_ids = [],
    province_ids = [],
    semester_ids = [],
    skill_ids = [],
    training_type_ids = [],
  } = training;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_trainings SET
                                            training_img = ?,
                                            training_name = ?, 
                                            training_slug = ?, 
                                            training_desc = ?, 
                                            training_price = ?,
                                            training_location = ?, 
                                            training_link = ?, 
                                            training_date = ?, 
                                            training_open_date = ?, 
                                            training_close_date = ?, 
                                            training_created_at = CURRENT_TIMESTAMP(),
                                            company_id = ?, 
                                            user_id = ?, 
                                            status_id = ?
                  WHERE training_id = ?`;
    const values = [training_img, training_name, training_slug, training_desc, training_price, training_location, training_link, training_date, training_open_date, training_close_date, company_id, user_id, status_id, training_id];
    await connection.query(query, values);
    await Promise.all([
      refreshPivot(connection, "tb_trainings_cities", "city_id", training_id, city_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_countries", "country_id", training_id, country_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_educations", "education_id", training_id, education_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_modes", "mode_id", training_id, mode_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_program_studies", "program_study_id", training_id, program_study_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_provinces", "province_id", training_id, province_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_semesters", "semester_id", training_id, semester_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_skills", "skill_id", training_id, skill_ids, "trainings"),
      refreshPivot(connection, "tb_trainings_training_types", "training_type_id", training_id, training_type_ids, "trainings"),
    ]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE BY ID
export async function deleteTrainingById(training_id) {
  const [result] = await db.query(`DELETE FROM tb_trainings WHERE training_id = ?`, [training_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getTrainingBaseQuery() {
  return `
  SELECT
    training.training_id,
    training.training_img,
    training.training_name,
    training.training_slug,
    training.training_desc,
    training.training_price,
    training.training_views,
    training.training_location,
    training.training_link,
    training.training_date,
    training.training_open_date,
    training.training_close_date,
    training.training_created_at,

    training.company_id,
    company.company_name,
    company.company_img,
    training.user_id,
    user.user_img,
    user.user_fullname,
    user.role_id,
    role.role_name,
    training.status_id,
    status.status_name,


    GROUP_CONCAT(DISTINCT city.city_id)              AS city_ids,
    GROUP_CONCAT(DISTINCT city.city_name)              AS city_names,
    GROUP_CONCAT(DISTINCT country.country_id)           AS country_ids,
    GROUP_CONCAT(DISTINCT country.country_name)           AS country_names,
    GROUP_CONCAT(DISTINCT education.education_id)        AS education_ids,
    GROUP_CONCAT(DISTINCT education.education_name)        AS education_names,
    GROUP_CONCAT(DISTINCT mode.mode_id)              AS mode_ids,
    GROUP_CONCAT(DISTINCT mode.mode_name)              AS mode_names,
    GROUP_CONCAT(DISTINCT program_study.program_study_id)  AS program_study_ids,
    GROUP_CONCAT(DISTINCT program_study.program_study_name)  AS program_study_names,
    GROUP_CONCAT(DISTINCT province.province_id)           AS province_ids,
    GROUP_CONCAT(DISTINCT province.province_name)           AS province_names,
    GROUP_CONCAT(DISTINCT semester.semester_id)           AS semester_ids,
    GROUP_CONCAT(DISTINCT semester.semester_no)           AS semester_nos,
    GROUP_CONCAT(DISTINCT skill.skill_id)             AS skill_ids,
    GROUP_CONCAT(DISTINCT skill.skill_name)             AS skill_names,
    GROUP_CONCAT(DISTINCT training_type.training_type_id)    AS training_type_ids,
    GROUP_CONCAT(DISTINCT training_type.training_type_name)    AS training_type_names,


     (
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT semester.semester_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT semester.semester_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT skill.skill_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT skill.skill_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT training_type.training_type_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT training_type.training_type_id), ''), ',', '')))
    ) AS total_relations

FROM tb_trainings training

#SINGLE
LEFT JOIN tb_statuses status ON training.status_id = status.status_id
LEFT JOIN tb_users user ON training.user_id = user.user_id
LEFT JOIN tb_roles role ON user.role_id = role.role_id
LEFT JOIN tb_companies company ON training.company_id = company.company_id

#MULTIPLE
LEFT JOIN tb_trainings_cities training_city ON training.training_id = training_city.training_id
LEFT JOIN tb_cities city ON training_city.city_id = city.city_id

LEFT JOIN tb_trainings_countries training_country ON training.training_id = training_country.training_id
LEFT JOIN tb_countries country ON training_country.country_id = country.country_id

LEFT JOIN tb_trainings_provinces training_province ON training.training_id = training_province.training_id
LEFT JOIN tb_provinces province ON training_province.province_id = province.province_id

LEFT JOIN tb_trainings_educations training_education ON training.training_id = training_education.training_id
LEFT JOIN tb_educations education ON training_education.education_id = education.education_id

LEFT JOIN tb_trainings_program_studies training_program_study ON training.training_id = training_program_study.training_id
LEFT JOIN tb_program_studies program_study ON training_program_study.program_study_id = program_study.program_study_id

LEFT JOIN tb_trainings_semesters training_semester ON training.training_id = training_semester.training_id
LEFT JOIN tb_semesters semester ON training_semester.semester_id = semester.semester_id

LEFT JOIN tb_trainings_modes training_mode ON training.training_id = training_mode.training_id
LEFT JOIN tb_modes mode ON training_mode.mode_id = mode.mode_id

LEFT JOIN tb_trainings_skills training_skill ON training.training_id = training_skill.training_id
LEFT JOIN tb_skills skill ON training_skill.skill_id  = skill.skill_id

LEFT JOIN tb_trainings_training_types training_training_type ON training.training_id = training_training_type.training_id
LEFT JOIN tb_training_types training_type ON training_training_type.training_type_id = training_type.training_type_id
  `;
}

//==============================================================================================================================================================

// READ BY SLUG
export async function getTrainingBySlug(training_slug) {
  const [rows] = await db.query(getTrainingBaseQuery() + ` WHERE training.training_slug = ? GROUP BY training.training_id`, [training_slug]);
  return rows[0];
}

// READ THREE LATEST
export async function getThreeLatestTraining() {
  const [rows] = await db.query(getTrainingBaseQuery() + ` WHERE status.status_id = 1 GROUP BY training.training_id ORDER BY training.training_created_at DESC LIMIT 3`);
  return rows;
}

// READ ALL– EXCEPT SLUG
export async function getTrainingAllExceptSlug(training_slug) {
  const [rows] = await db.query(
    getTrainingBaseQuery() +
      ` WHERE status.status_id = 1
        AND training.training_slug <> ?
        GROUP BY training.training_id
        ORDER BY RAND()
        LIMIT 3`,
    [training_slug]
  );
  return rows;
}

// UPDATE VIEW
export async function incrementViewBySlug(training_slug) {
  await db.query(`UPDATE tb_trainings SET training_views = training_views + 1 WHERE training_slug = ?`, [training_slug]);
  const [rows] = await db.query(`SELECT training_views FROM tb_trainings WHERE training_slug = ?`, [training_slug]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortTrainings({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getTrainingBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY trainings.training_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY training.training_id ORDER BY training.training_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                      training.training_name LIKE ? OR 
                      training.training_price LIKE ? OR
                      training.training_location LIKE ? OR 
                      training.training_link LIKE ? OR 
                      company.company_name LIKE ? OR 
                      user.user_fullname LIKE ? OR 
                      city.city_name LIKE ? OR 
                      country.country_name LIKE ? OR 
                      education.education_name LIKE ? OR 
                      mode.mode_name LIKE ? OR 
                      program_study.program_study_name LIKE ? OR 
                      province.province_name LIKE ? OR 
                      semester.semester_no LIKE ? OR 
                      skill.skill_name LIKE ? OR 
                      training_type.training_type_name LIKE ?)`);
    values.push(...Array(15).fill(keyword));
  }

  const dateFilters = ["training_date", "training_open_date", "training_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`training.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  const directFilters = ["company_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`training.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY training.training_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS trainings`;

  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "mode_id", "program_study_id", "province_id", "semester_id", "skill_id", "training_type_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, trainings.${alias})`);
      postValues.push(filters[field]);
    }
  }

  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...dateFilters, ...directFilters, ...multiSelectFilters, "training_price", "training_views", "training_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      if (field === "training_price" || field === "training_views" || field === "training_created_at") {
        orderBy = `ORDER BY trainings.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY trainings.total_relations ASC, trainings.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}

// SEARCH FILTER SORT ACTIVE
export async function searchFilterSortTrainingsActive({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getTrainingBaseQuery();
  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;
  let orderBy = `ORDER BY trainings.training_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} WHERE training.status_id = 1 GROUP BY training.training_id ORDER BY training.training_created_at DESC`);
    return rows;
  }

  const conditions = ["training.status_id = 1"];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                      training.training_name LIKE ? OR 
                      training.training_price LIKE ? OR
                      training.training_location LIKE ? OR 
                      training.training_link LIKE ? OR 
                      company.company_name LIKE ? OR 
                      user.user_fullname LIKE ? OR 
                      city.city_name LIKE ? OR 
                      country.country_name LIKE ? OR 
                      education.education_name LIKE ? OR 
                      mode.mode_name LIKE ? OR 
                      program_study.program_study_name LIKE ? OR 
                      province.province_name LIKE ? OR 
                      semester.semester_no LIKE ? OR 
                      skill.skill_name LIKE ? OR 
                      training_type.training_type_name LIKE ?)`);
    values.push(...Array(15).fill(keyword));
  }

  const dateFilters = ["training_date", "training_open_date", "training_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`training.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  const directFilters = ["company_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`training.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY training.training_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS trainings`;

  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "mode_id", "program_study_id", "province_id", "semester_id", "skill_id", "training_type_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, trainings.${alias})`);
      postValues.push(filters[field]);
    }
  }

  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...dateFilters, ...directFilters, ...multiSelectFilters, "training_price", "training_views", "training_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      if (field === "training_price" || field === "training_views" || field === "training_created_at") {
        orderBy = `ORDER BY trainings.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY trainings.total_relations ASC, trainings.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}

// GET SUMMARY
export async function getSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total_all,
      COUNT(CASE WHEN status_id = 1 THEN 1 END) AS total_status_1,
      COUNT(CASE WHEN status_id = 2 THEN 1 END) AS total_status_2
    FROM tb_trainings
  `);
  return rows[0];
}
