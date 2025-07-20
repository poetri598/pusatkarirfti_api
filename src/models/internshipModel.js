import db from "../configs/database.js";
import { allowedPivotTables } from "../utils/pivotTables.js";

// Refresh pivot tables
async function refreshPivot(conn, table, column, internship_id, ids = [], entity = "internships") {
  const allowedTablesForEntity = allowedPivotTables[entity] || [];
  if (!allowedTablesForEntity.includes(table)) {
    throw new Error(`"${table}" pada "${entity}" tidak ditemukan`);
  }
  if (!Array.isArray(ids)) {
    ids = typeof ids === "string" ? ids.split(",").map((v) => Number(v.trim())) : [];
  }
  await conn.query(`DELETE FROM ?? WHERE internship_id = ?`, [table, internship_id]);
  if (ids.length) {
    const rows = ids.map((v) => [internship_id, v]);
    await conn.query(`INSERT INTO ?? (internship_id, ??) VALUES ?`, [table, column, rows]);
  }
}

// CREATE
export async function createInternship(internship) {
  const connection = await db.getConnection();
  const {
    internship_img,
    internship_name,
    internship_slug,
    internship_desc,
    internship_location,
    internship_link,
    internship_start_date,
    internship_end_date,
    internship_open_date,
    internship_close_date,
    internship_type_id,
    ipk_id,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    gender_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
    religion_ids = [],
    semester_ids = [],
  } = internship;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_internships (
                                    internship_img,
                                    internship_name,
                                    internship_slug,
                                    internship_desc,
                                    internship_location,
                                    internship_link,
                                    internship_start_date,
                                    internship_end_date,
                                    internship_open_date,
                                    internship_close_date,
                                    internship_type_id,
                                    ipk_id,
                                    company_id,
                                    user_id,
                                    status_id
                                  ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      internship_img,
      internship_name,
      internship_slug,
      internship_desc,
      internship_location,
      internship_link,
      internship_start_date,
      internship_end_date,
      internship_open_date,
      internship_close_date,
      internship_type_id,
      ipk_id,
      company_id,
      user_id,
      status_id,
    ];
    const [res] = await connection.query(query, values);
    const internship_id = res.insertId;
    await Promise.all([
      refreshPivot(connection, "tb_internships_cities", "city_id", internship_id, city_ids, "internships"),
      refreshPivot(connection, "tb_internships_countries", "country_id", internship_id, country_ids, "internships"),
      refreshPivot(connection, "tb_internships_educations", "education_id", internship_id, education_ids, "internships"),
      refreshPivot(connection, "tb_internships_genders", "gender_id", internship_id, gender_ids, "internships"),
      refreshPivot(connection, "tb_internships_modes", "mode_id", internship_id, mode_ids, "internships"),
      refreshPivot(connection, "tb_internships_positions", "position_id", internship_id, position_ids, "internships"),
      refreshPivot(connection, "tb_internships_program_studies", "program_study_id", internship_id, program_study_ids, "internships"),
      refreshPivot(connection, "tb_internships_provinces", "province_id", internship_id, province_ids, "internships"),
      refreshPivot(connection, "tb_internships_religions", "religion_id", internship_id, religion_ids, "internships"),
      refreshPivot(connection, "tb_internships_semesters", "semester_id", internship_id, semester_ids, "internships"),
    ]);
    await connection.commit();
    return { internship_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getInternshipAll() {
  const [rows] = await db.query(getInternshipBaseQuery() + ` WHERE status.status_id = 1 GROUP BY internship.internship_id ORDER BY internship.internship_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getInternshipById(internship_id) {
  const [rows] = await db.query(getInternshipBaseQuery() + ` WHERE internship.internship_id = ? GROUP BY internship.internship_id`, [internship_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateInternshipById(internship_id, internship) {
  const connection = await db.getConnection();
  const {
    internship_img,
    internship_name,
    internship_slug,
    internship_desc,
    internship_location,
    internship_link,
    internship_start_date,
    internship_end_date,
    internship_open_date,
    internship_close_date,
    internship_type_id,
    ipk_id,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    gender_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
    religion_ids = [],
    semester_ids = [],
  } = internship;
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_internships SET
                                internship_img = ?,
                                internship_name = ?,
                                internship_slug = ?,
                                internship_desc = ?,
                                internship_location = ?,
                                internship_link = ?,
                                internship_start_date = ?,
                                internship_end_date = ?,
                                internship_open_date = ?,
                                internship_close_date = ?,
                                internship_created_at= CURRENT_TIMESTAMP(),
                                internship_type_id = ?,
                                ipk_id = ?,
                                company_id = ?,
                                user_id = ?,
                                status_id = ?
      WHERE internship_id = ?`;
    const values = [
      internship_img,
      internship_name,
      internship_slug,
      internship_desc,
      internship_location,
      internship_link,
      internship_start_date,
      internship_end_date,
      internship_open_date,
      internship_close_date,
      internship_type_id,
      ipk_id,
      company_id,
      user_id,
      status_id,
      internship_id,
    ];
    await connection.query(query, values);
    await Promise.all([
      refreshPivot(connection, "tb_internships_cities", "city_id", internship_id, city_ids, "internships"),
      refreshPivot(connection, "tb_internships_countries", "country_id", internship_id, country_ids, "internships"),
      refreshPivot(connection, "tb_internships_educations", "education_id", internship_id, education_ids, "internships"),
      refreshPivot(connection, "tb_internships_genders", "gender_id", internship_id, gender_ids, "internships"),
      refreshPivot(connection, "tb_internships_modes", "mode_id", internship_id, mode_ids, "internships"),
      refreshPivot(connection, "tb_internships_positions", "position_id", internship_id, position_ids, "internships"),
      refreshPivot(connection, "tb_internships_program_studies", "program_study_id", internship_id, program_study_ids, "internships"),
      refreshPivot(connection, "tb_internships_provinces", "province_id", internship_id, province_ids, "internships"),
      refreshPivot(connection, "tb_internships_religions", "religion_id", internship_id, religion_ids, "internships"),
      refreshPivot(connection, "tb_internships_semesters", "semester_id", internship_id, semester_ids, "internships"),
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
export async function deleteInternshipById(internship_id) {
  const [result] = await db.query(`DELETE FROM tb_internships WHERE internship_id = ?`, [internship_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getInternshipBaseQuery() {
  return `
  SELECT
    internship.internship_id,
    internship.internship_img,
    internship.internship_name,
    internship.internship_slug,
    internship.internship_desc,
    internship.internship_views,
    internship.internship_location,
    internship.internship_link,
    internship.internship_start_date,
    internship.internship_end_date,
    internship.internship_open_date,
    internship.internship_close_date,
    internship.internship_created_at,
    internship.internship_type_id,
    internship_type.internship_type_name,
    internship.ipk_id,
    ipk.ipk_no,
    internship.company_id,
    company.company_name,
    company.company_img,
    internship.user_id,
    user.user_img,
    user.user_fullname,
    user.role_id,
    role.role_name,
    status.status_id,
    status.status_name,


    GROUP_CONCAT(DISTINCT city.city_id)              AS city_ids,
    GROUP_CONCAT(DISTINCT city.city_name)              AS city_names,
    GROUP_CONCAT(DISTINCT country.country_id)           AS country_ids,
    GROUP_CONCAT(DISTINCT country.country_name)           AS country_names,
    GROUP_CONCAT(DISTINCT education.education_id)        AS education_ids,
    GROUP_CONCAT(DISTINCT education.education_name)        AS education_names,
    GROUP_CONCAT(DISTINCT gender.gender_id)           AS gender_ids,
    GROUP_CONCAT(DISTINCT gender.gender_name)           AS gender_names,
    GROUP_CONCAT(DISTINCT mode.mode_id)              AS mode_ids,
    GROUP_CONCAT(DISTINCT mode.mode_name)              AS mode_names,
    GROUP_CONCAT(DISTINCT position.position_id)         AS position_ids,
    GROUP_CONCAT(DISTINCT position.position_name)         AS position_names,
    GROUP_CONCAT(DISTINCT program_study.program_study_id)  AS program_study_ids,
    GROUP_CONCAT(DISTINCT program_study.program_study_name)  AS program_study_names,
    GROUP_CONCAT(DISTINCT province.province_id)           AS province_ids,
    GROUP_CONCAT(DISTINCT province.province_name)           AS province_names,
    GROUP_CONCAT(DISTINCT religion.religion_id)           AS religion_ids,
    GROUP_CONCAT(DISTINCT religion.religion_name)           AS religion_names,
    GROUP_CONCAT(DISTINCT semester.semester_id)           AS semester_ids,
    GROUP_CONCAT(DISTINCT semester.semester_no)           AS semester_nos,



    (
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT gender.gender_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT gender.gender_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT religion.religion_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT religion.religion_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT semester.semester_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT semester.semester_id), ''), ',', '')))
    ) AS total_relations

  FROM tb_internships internship


  #SINGLE
  LEFT JOIN tb_statuses status ON internship.status_id = status.status_id
  LEFT JOIN tb_users user ON internship.user_id = user.user_id
  LEFT JOIN tb_roles role ON user.role_id = role.role_id
  LEFT JOIN tb_internship_types internship_type ON internship.internship_type_id = internship_type.internship_type_id
  LEFT JOIN tb_companies company ON internship.company_id = company.company_id
  LEFT JOIN tb_ipks ipk ON internship.ipk_id = ipk.ipk_id


  #MULTIPLE
  LEFT JOIN tb_internships_cities internship_city ON internship.internship_id = internship_city.internship_id
  LEFT JOIN tb_cities city ON internship_city.city_id = city.city_id

  LEFT JOIN tb_internships_countries internship_country ON internship.internship_id = internship_country.internship_id
  LEFT JOIN tb_countries country ON internship_country.country_id = country.country_id

  LEFT JOIN tb_internships_educations internship_education ON internship.internship_id = internship_education.internship_id
  LEFT JOIN tb_educations education ON internship_education.education_id = education.education_id

  LEFT JOIN tb_internships_genders internship_gender ON internship.internship_id = internship_gender.internship_id
  LEFT JOIN tb_genders gender ON internship_gender.gender_id = gender.gender_id

  LEFT JOIN tb_internships_modes internship_mode ON internship.internship_id = internship_mode.internship_id
  LEFT JOIN tb_modes mode ON internship_mode.mode_id = mode.mode_id

  LEFT JOIN tb_internships_positions internship_position ON internship.internship_id = internship_position.internship_id
  LEFT JOIN tb_positions position ON internship_position.position_id = position.position_id

  LEFT JOIN tb_internships_program_studies internship_program_study ON internship.internship_id = internship_program_study.internship_id
  LEFT JOIN tb_program_studies program_study ON internship_program_study.program_study_id = program_study.program_study_id

  LEFT JOIN tb_internships_provinces internship_province ON internship.internship_id = internship_province.internship_id
  LEFT JOIN tb_provinces province ON internship_province.province_id = province.province_id

  LEFT JOIN tb_internships_religions internship_religion ON internship.internship_id = internship_religion.internship_id
  LEFT JOIN tb_religions religion ON internship_religion.religion_id = religion.religion_id

  LEFT JOIN tb_internships_semesters internship_semester ON internship.internship_id = internship_semester.internship_id
  LEFT JOIN tb_semesters semester ON internship_semester.semester_id = semester.semester_id
  `;
}

// =======================================================================================================================================

// READ BY SLUG
export async function getInternshipBySlug(internship_slug) {
  const [rows] = await db.query(getInternshipBaseQuery() + ` WHERE internship.internship_slug = ? GROUP BY internship.internship_id`, [internship_slug]);
  return rows[0];
}

// READ THREE LATEST
export async function getThreeLatestInternship() {
  const [rows] = await db.query(
    getInternshipBaseQuery() +
      ` 
      
      WHERE status.status_id = 1
      GROUP BY internship.internship_id
      ORDER BY internship.internship_created_at DESC
      LIMIT 3

      `
  );
  return rows;
}

// READ ALL– EXCEPT SLUG
export async function getInternshipAllExceptSlug(internship_slug) {
  const [rows] = await db.query(
    getInternshipBaseQuery() +
      ` 

      WHERE status.status_id = 1
      AND internship.internship_slug <> ?
      GROUP BY internship.internship_id
      ORDER BY RAND()
      LIMIT 3
      
      `,
    [internship_slug]
  );
  return rows;
}

// UPDATE VIEW
export async function incrementViewBySlug(internship_slug) {
  await db.query(`UPDATE tb_internships SET internship_views = internship_views + 1 WHERE internship_slug = ?`, [internship_slug]);
  const [rows] = await db.query(`SELECT internship_views FROM tb_internships WHERE internship_slug = ?`, [internship_slug]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortInternships({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getInternshipBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY internships.total_relations ASC, internships.internship_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY internship.internship_id ORDER BY internship.internship_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        internship.internship_name LIKE ? OR 
                        internship.internship_location LIKE ? OR 
                        internship.internship_link LIKE ? OR
                        internship_type.internship_type_name LIKE ? OR 
                        company.company_name LIKE ? OR 
                        user.user_fullname LIKE ? OR
                        ipk.ipk_no LIKE ? OR 
                        city.city_name LIKE ? OR 
                        country.country_name LIKE ? OR
                        education.education_name LIKE ? OR 
                        gender.gender_name LIKE ? OR 
                        mode.mode_name LIKE ? OR 
                        position.position_name LIKE ? OR
                        program_study.program_study_name LIKE ? OR 
                        province.province_name LIKE ? OR 
                        religion.religion_name LIKE ? OR
                        semester.semester_no LIKE ?
    )`);
    values.push(...Array(17).fill(keyword));
  }

  // Date filters
  const dateFilters = ["internship_start_date", "internship_end_date", "internship_open_date", "internship_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`internship.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  const directFilters = ["internship_type_id", "ipk_id", "company_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (field === "ipk_id" && filters[field] !== "" && filters[field] !== undefined) {
      conditions.push(`ipk.ipk_no >= ( SELECT ipk_no FROM tb_ipks WHERE ipk_id = ?)`);
      values.push(filters[field]);
    } else if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`internship.${field} = ?`);
      values.push(filters[field]);
    }
  }

  // Base where
  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY internship.internship_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS internships`;

  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "gender_id", "mode_id", "position_id", "program_study_id", "province_id", "religion_id", "semester_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, internships.${alias})`);
      postValues.push(filters[field]);
    }
  }

  // Final where
  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  // Sort
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...dateFilters, ...directFilters, ...multiSelectFilters, "internship_views", "internship_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      if (field === "internship_views" || field === "internship_created_at") {
        orderBy = `ORDER BY internships.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY internships.total_relations ASC, internships.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}

// SEARCH FILTER SORT ACTIVE
export async function searchFilterSortInternshipsActive({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getInternshipBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY internships.total_relations ASC, internships.internship_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} WHERE internship.status_id = 1 GROUP BY internship.internship_id ORDER BY internship.internship_created_at DESC`);
    return rows;
  }

  const conditions = ["internship.status_id = 1"];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        internship.internship_name LIKE ? OR 
                        internship.internship_location LIKE ? OR 
                        internship.internship_link LIKE ? OR
                        internship_type.internship_type_name LIKE ? OR 
                        company.company_name LIKE ? OR 
                        user.user_fullname LIKE ? OR
                        ipk.ipk_no LIKE ? OR 
                        city.city_name LIKE ? OR 
                        country.country_name LIKE ? OR
                        education.education_name LIKE ? OR 
                        gender.gender_name LIKE ? OR 
                        mode.mode_name LIKE ? OR 
                        position.position_name LIKE ? OR
                        program_study.program_study_name LIKE ? OR 
                        province.province_name LIKE ? OR 
                        religion.religion_name LIKE ? OR
                        semester.semester_no LIKE ?
    )`);
    values.push(...Array(17).fill(keyword));
  }

  // Date filters
  const dateFilters = ["internship_start_date", "internship_end_date", "internship_open_date", "internship_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`internship.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  const directFilters = ["internship_type_id", "ipk_id", "company_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (field === "ipk_id" && filters[field] !== "" && filters[field] !== undefined) {
      conditions.push(`ipk.ipk_no >= ( SELECT ipk_no FROM tb_ipks WHERE ipk_id = ?)`);
      values.push(filters[field]);
    } else if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`internship.${field} = ?`);
      values.push(filters[field]);
    }
  }

  // Base where
  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY internship.internship_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS internships`;

  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "gender_id", "mode_id", "position_id", "program_study_id", "province_id", "religion_id", "semester_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, internships.${alias})`);
      postValues.push(filters[field]);
    }
  }

  // Final where
  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  // Sort
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...dateFilters, ...directFilters, ...multiSelectFilters, "internship_views", "internship_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      if (field === "internship_views" || field === "internship_created_at") {
        orderBy = `ORDER BY internships.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY internships.total_relations ASC, internships.${alias} ${dir.toUpperCase()}`;
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
    FROM tb_internships
  `);
  return rows[0];
}
