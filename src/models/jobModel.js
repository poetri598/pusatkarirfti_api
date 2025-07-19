import db from "../configs/database.js";
import { allowedPivotTables } from "../utils/pivotTables.js";

// Refresh pivot tables
async function refreshPivot(conn, table, column, job_id, ids = [], entity = "jobs") {
  const allowedTablesForEntity = allowedPivotTables[entity] || [];
  if (!allowedTablesForEntity.includes(table)) {
    throw new Error(`"${table}" pada "${entity}" tidak ditemukan`);
  }
  if (!Array.isArray(ids)) {
    ids = typeof ids === "string" ? ids.split(",").map((v) => Number(v.trim())) : [];
  }
  await conn.query(`DELETE FROM ?? WHERE job_id = ?`, [table, job_id]);
  if (ids.length) {
    const rows = ids.map((v) => [job_id, v]);
    await conn.query(`INSERT INTO ?? (job_id, ??) VALUES ?`, [table, column, rows]);
  }
}

// CREATE
export async function createJob(job) {
  const connection = await db.getConnection();
  const {
    job_img,
    job_name,
    job_slug,
    job_desc,
    job_salary_min,
    job_salary_max,
    job_location,
    job_link,
    job_open_date,
    job_close_date,
    age_min_id,
    age_max_id,
    weight_min_id,
    weight_max_id,
    height_min_id,
    height_max_id,
    job_type_id,
    ipk_id,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    experience_ids = [],
    gender_ids = [],
    marital_status_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
    religion_ids = [],
  } = job;
  try {
    await connection.beginTransaction();
    const query = `INSERT INTO tb_jobs (
                                        job_img, 
                                        job_name,
                                        job_slug, 
                                        job_desc, 
                                        job_salary_min,
                                        job_salary_max,
                                        job_location,
                                        job_link,
                                        job_open_date,
                                        job_close_date,
                                        age_min_id,
                                        age_max_id,
                                        weight_min_id,
                                        weight_max_id,
                                        height_min_id,
                                        height_max_id,
                                        job_type_id,
                                        ipk_id,
                                        company_id,
                                        user_id,
                                        status_id
                                        ) 
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [
      job_img,
      job_name,
      job_slug,
      job_desc,
      job_salary_min,
      job_salary_max,
      job_location,
      job_link,
      job_open_date,
      job_close_date,
      age_min_id,
      age_max_id,
      weight_min_id,
      weight_max_id,
      height_min_id,
      height_max_id,
      job_type_id,
      ipk_id,
      company_id,
      user_id,
      status_id,
    ];
    const [res] = await connection.query(query, values);
    const job_id = res.insertId;
    await Promise.all([
      refreshPivot(connection, "tb_jobs_cities", "city_id", job_id, city_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_countries", "country_id", job_id, country_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_educations", "education_id", job_id, education_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_experiences", "experience_id", job_id, experience_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_genders", "gender_id", job_id, gender_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_marital_statuses", "marital_status_id", job_id, marital_status_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_modes", "mode_id", job_id, mode_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_positions", "position_id", job_id, position_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_program_studies", "program_study_id", job_id, program_study_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_provinces", "province_id", job_id, province_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_religions", "religion_id", job_id, religion_ids, "jobs"),
    ]);
    await connection.commit();
    return { job_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getJobAll() {
  const [rows] = await db.query(getJobBaseQuery() + ` WHERE status.status_id = 1 GROUP BY job.job_id ORDER BY job.job_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getJobById(job_id) {
  const [rows] = await db.query(getJobBaseQuery() + ` WHERE job.job_id = ? GROUP BY job.job_id`, [job_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateJobById(job_id, job) {
  const connection = await db.getConnection();
  const {
    job_img,
    job_name,
    job_slug,
    job_desc,
    job_salary_min,
    job_salary_max,
    job_location,
    job_link,
    job_open_date,
    job_close_date,
    age_min_id,
    age_max_id,
    weight_min_id,
    weight_max_id,
    height_min_id,
    height_max_id,
    job_type_id,
    ipk_id,
    company_id,
    user_id,
    status_id,
    city_ids = [],
    country_ids = [],
    education_ids = [],
    experience_ids = [],
    gender_ids = [],
    marital_status_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
    religion_ids = [],
  } = job;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_jobs SET
                                      job_img = ?,
                                      job_name = ?,
                                      job_slug = ?,
                                      job_desc = ?,
                                      job_salary_min = ?,
                                      job_salary_max = ?,
                                      job_location = ?,
                                      job_link = ?,
                                      job_open_date = ?,
                                      job_close_date = ?,
                                      job_created_at = CURRENT_TIMESTAMP(),
                                      age_min_id = ?,
                                      age_max_id = ?,
                                      weight_min_id = ?,
                                      weight_max_id = ?,
                                      height_min_id = ?,
                                      height_max_id = ?,
                                      job_type_id = ?,
                                      ipk_id = ?,
                                      company_id = ?,
                                      user_id = ?,
                                      status_id = ?
                    WHERE job_id = ?`;
    const values = [
      job_img,
      job_name,
      job_slug,
      job_desc,
      job_salary_min,
      job_salary_max,
      job_location,
      job_link,
      job_open_date,
      job_close_date,
      age_min_id,
      age_max_id,
      weight_min_id,
      weight_max_id,
      height_min_id,
      height_max_id,
      job_type_id,
      ipk_id,
      company_id,
      user_id,
      status_id,
      job_id,
    ];
    await connection.query(query, values);
    await Promise.all([
      refreshPivot(connection, "tb_jobs_cities", "city_id", job_id, city_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_countries", "country_id", job_id, country_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_educations", "education_id", job_id, education_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_experiences", "experience_id", job_id, experience_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_genders", "gender_id", job_id, gender_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_marital_statuses", "marital_status_id", job_id, marital_status_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_modes", "mode_id", job_id, mode_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_positions", "position_id", job_id, position_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_program_studies", "program_study_id", job_id, program_study_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_provinces", "province_id", job_id, province_ids, "jobs"),
      refreshPivot(connection, "tb_jobs_religions", "religion_id", job_id, religion_ids, "jobs"),
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
export async function deleteJobById(job_id) {
  const [result] = await db.query(`DELETE FROM tb_jobs WHERE job_id = ?`, [job_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getJobBaseQuery() {
  return `
  SELECT
    job.job_id,
    job.job_img,
    job.job_name,
    job.job_slug,
    job.job_desc,
    job.job_views,
    job.job_salary_min,
    job.job_salary_max,
    job.job_location,
    job.job_link,
    job.job_open_date,
    job.job_close_date,
    job.job_created_at,

    age_min.age_id AS age_min_id,
    age_min.age_no AS age_min_no,
    age_max.age_id AS age_max_id,
    age_max.age_no AS age_max_no,
    weight_min.weight_id AS weight_min_id,
    weight_min.weight_no AS weight_min_no,
    weight_max.weight_id AS weight_max_id,
    weight_max.weight_no AS weight_max_no,
    height_min.height_id AS height_min_id,
    height_min.height_no AS height_min_no,
    height_max.height_id AS height_max_id,
    height_max.height_no AS height_max_no,
    job_type.job_type_id,
    job_type.job_type_name,
    ipk.ipk_id,
    ipk.ipk_no,
    company.company_id,
    company.company_img,
    company.company_name,
    user.user_id,
    user.user_img,
    user.user_fullname,
    role.role_id,
    role.role_name,
    status.status_id,
    status.status_name,

    GROUP_CONCAT(DISTINCT city.city_id) AS city_ids,
    GROUP_CONCAT(DISTINCT city.city_name) AS city_names,
    GROUP_CONCAT(DISTINCT country.country_name) AS country_names,
    GROUP_CONCAT(DISTINCT country.country_id) AS country_ids,
    GROUP_CONCAT(DISTINCT education.education_id) AS education_ids,
    GROUP_CONCAT(DISTINCT education.education_name) AS education_names,
    GROUP_CONCAT(DISTINCT experience.experience_id) AS experience_ids,
    GROUP_CONCAT(DISTINCT experience.experience_name) AS experience_names,
    GROUP_CONCAT(DISTINCT gender.gender_id) AS gender_ids,
    GROUP_CONCAT(DISTINCT gender.gender_name) AS gender_names,
    GROUP_CONCAT(DISTINCT marital_status.marital_status_id) AS marital_status_ids,
    GROUP_CONCAT(DISTINCT marital_status.marital_status_name) AS marital_status_names,
    GROUP_CONCAT(DISTINCT mode.mode_id) AS mode_ids,
    GROUP_CONCAT(DISTINCT mode.mode_name) AS mode_names,
    GROUP_CONCAT(DISTINCT position.position_id) AS position_ids,
    GROUP_CONCAT(DISTINCT position.position_name) AS position_names,
    GROUP_CONCAT(DISTINCT program_study.program_study_id) AS program_study_ids,
    GROUP_CONCAT(DISTINCT program_study.program_study_name) AS program_study_names,
    GROUP_CONCAT(DISTINCT province.province_id) AS province_ids,
    GROUP_CONCAT(DISTINCT province.province_name) AS province_names,
    GROUP_CONCAT(DISTINCT religion.religion_id) AS religion_ids,
    GROUP_CONCAT(DISTINCT religion.religion_name) AS religion_names,

    (
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT experience.experience_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT experience.experience_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT gender.gender_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT gender.gender_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT marital_status.marital_status_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT marital_status.marital_status_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT religion.religion_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT religion.religion_id), ''), ',', '')))
    ) AS total_relations

  FROM tb_jobs job

  # SINGLE 
  LEFT JOIN tb_ages age_min ON job.age_min_id = age_min.age_id
  LEFT JOIN tb_ages age_max ON job.age_max_id = age_max.age_id
  LEFT JOIN tb_weights weight_min ON job.weight_min_id = weight_min.weight_id
  LEFT JOIN tb_weights weight_max ON job.weight_max_id = weight_max.weight_id
  LEFT JOIN tb_heights height_min ON job.height_min_id = height_min.height_id
  LEFT JOIN tb_heights height_max ON job.height_max_id = height_max.height_id
  LEFT JOIN tb_job_types job_type ON job.job_type_id = job_type.job_type_id
  LEFT JOIN tb_ipks ipk ON job.ipk_id = ipk.ipk_id
  LEFT JOIN tb_companies company ON job.company_id = company.company_id
  LEFT JOIN tb_users user ON job.user_id = user.user_id
  LEFT JOIN tb_roles role ON user.role_id = role.role_id
  LEFT JOIN tb_statuses status ON job.status_id = status.status_id

  # MULTIPLE
  LEFT JOIN tb_jobs_cities job_city ON job.job_id = job_city.job_id
  LEFT JOIN tb_cities city ON job_city.city_id = city.city_id
  LEFT JOIN tb_jobs_countries job_country ON job.job_id = job_country.job_id
  LEFT JOIN tb_countries country ON job_country.country_id = country.country_id
  LEFT JOIN tb_jobs_educations job_education ON job.job_id = job_education.job_id
  LEFT JOIN tb_educations education ON job_education.education_id = education.education_id
  LEFT JOIN tb_jobs_experiences job_experience ON job.job_id = job_experience.job_id
  LEFT JOIN tb_experiences experience ON job_experience.experience_id = experience.experience_id
  LEFT JOIN tb_jobs_genders job_gender ON job.job_id = job_gender.job_id
  LEFT JOIN tb_genders gender ON job_gender.gender_id = gender.gender_id
  LEFT JOIN tb_jobs_marital_statuses job_marital_status ON job.job_id = job_marital_status.job_id
  LEFT JOIN tb_marital_statuses marital_status ON job_marital_status.marital_status_id = marital_status.marital_status_id
  LEFT JOIN tb_jobs_modes job_mode ON job.job_id = job_mode.job_id
  LEFT JOIN tb_modes mode ON job_mode.mode_id = mode.mode_id
  LEFT JOIN tb_jobs_positions job_position ON job.job_id = job_position.job_id
  LEFT JOIN tb_positions position ON job_position.position_id = position.position_id
  LEFT JOIN tb_jobs_program_studies job_program_study ON job.job_id = job_program_study.job_id
  LEFT JOIN tb_program_studies program_study ON job_program_study.program_study_id = program_study.program_study_id
  LEFT JOIN tb_jobs_provinces job_province ON job.job_id = job_province.job_id
  LEFT JOIN tb_provinces province ON job_province.province_id = province.province_id
  LEFT JOIN tb_jobs_religions job_religion ON job.job_id = job_religion.job_id
  LEFT JOIN tb_religions religion ON job_religion.religion_id = religion.religion_id
  `;
}

// ================================================================================================================================================================

// READ BY SLUG
export async function getJobBySlug(job_slug) {
  const [rows] = await db.query(getJobBaseQuery() + ` WHERE job.job_slug = ? GROUP BY job.job_id`, [job_slug]);
  return rows[0];
}

// READ THREE LATEST
export async function getThreeLatestJob() {
  const [rows] = await db.query(
    getJobBaseQuery() +
      ` 

        WHERE status.status_id = 1
        GROUP BY job.job_id
        ORDER BY job.job_created_at DESC
        LIMIT 3

      `
  );
  return rows;
}

// READ ALL– EXCEPT SLUG
export async function getJobAllExceptSlug(job_slug) {
  const [rows] = await db.query(
    getJobBaseQuery() +
      ` 
      
      WHERE status.status_id = 1
      AND job.job_slug <> ?
      GROUP BY job.job_id
      ORDER BY RAND()
      LIMIT 3
      
      `,
    [job_slug]
  );
  return rows;
}

// UPDATE VIEW
export async function incrementViewBySlug(job_slug) {
  await db.query(`UPDATE tb_jobs SET job_views = job_views + 1 WHERE job_slug = ?`, [job_slug]);
  const [rows] = await db.query(`SELECT job_views FROM tb_jobs WHERE job_slug = ?`, [job_slug]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortJobs({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getJobBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  // Sorting
  let orderBy = `ORDER BY jobs.total_relations ASC, jobs.job_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY job.job_id ORDER BY job.job_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      job.job_name LIKE ? OR 
      job.job_location LIKE ? OR 
      job.job_link LIKE ? OR
      job_type.job_type_name LIKE ? OR 
      ipk.ipk_no LIKE ? OR 
      company.company_name LIKE ? OR 
      user.user_fullname LIKE ? OR
      city.city_name LIKE ? OR 
      country.country_name LIKE ? OR
      education.education_name LIKE ? OR 
      experience.experience_name LIKE ? OR 
      gender.gender_name LIKE ? OR
      marital_status.marital_status_name LIKE ? OR 
      mode.mode_name LIKE ? OR 
      position.position_name LIKE ? OR
      program_study.program_study_name LIKE ? OR 
      province.province_name LIKE ? OR 
      religion.religion_name LIKE ?
    )`);
    values.push(...Array(18).fill(keyword));
  }

  // Numeric filters
  const numericFilters = ["job_salary_min", "job_salary_max"];
  for (const field of numericFilters) {
    if (field === "job_salary_min" && filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} >= ?`);
      values.push(filters[field]);
    } else if (field === "job_salary_max" && filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} <= ?`);
      values.push(filters[field]);
    } else if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} = ?`);
      values.push(filters[field]);
    }
  }

  // Date filters
  const dateFilters = ["job_open_date", "job_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`job.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  // Direct filters
  const directFilters = ["age_min_id", "age_max_id", "weight_min_id", "weight_max_id", "height_min_id", "height_max_id", "job_type_id", "ipk_id", "company_id", "user_id", "status_id"];

  for (const field of directFilters) {
    const value = filters[field];
    if (value !== undefined && value !== "") {
      if (field === "age_min_id") {
        conditions.push(`age_min.age_no >= (SELECT age_no FROM tb_ages WHERE age_id = ?)`);
      } else if (field === "age_max_id") {
        conditions.push(`age_max.age_no <= (SELECT age_no FROM tb_ages WHERE age_id = ?)`);
      } else if (field === "weight_min_id") {
        conditions.push(`weight_min.weight_no >= (SELECT weight_no FROM tb_weights WHERE weight_id = ?)`);
      } else if (field === "weight_max_id") {
        conditions.push(`weight_max.weight_no <= (SELECT weight_no FROM tb_weights WHERE weight_id = ?)`);
      } else if (field === "height_min_id") {
        conditions.push(`height_min.height_no >= (SELECT height_no FROM tb_heights WHERE height_id = ?)`);
      } else if (field === "height_max_id") {
        conditions.push(`height_max.height_no <= (SELECT height_no FROM tb_heights WHERE height_id = ?)`);
      } else if (field === "ipk_id") {
        conditions.push(`ipk.ipk_no >= (SELECT ipk_no FROM tb_ipks WHERE ipk_id = ?)`);
      } else {
        conditions.push(`job.${field} = ?`);
      }
      values.push(value);
    }
  }

  // Base where
  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY job.job_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS jobs`;

  // Multi-select filters
  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "experience_id", "gender_id", "marital_status_id", "mode_id", "position_id", "program_study_id", "province_id", "religion_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, jobs.${alias})`);
      postValues.push(filters[field]);
    }
  }

  // Final where
  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...numericFilters, ...dateFilters, ...directFilters, ...multiSelectFilters, "job_views", "job_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      // Khusus sorting by job_views atau job_created_at tanpa total_relations
      if (field === "job_views" || field === "job_created_at") {
        orderBy = `ORDER BY jobs.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY jobs.total_relations ASC, jobs.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  console.log(finalQuery);
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}

// SEARCH FILTER SORT ACTIVE
export async function searchFilterSortJobsActive({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getJobBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  // Sorting
  let orderBy = `ORDER BY jobs.total_relations ASC, jobs.job_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} WHERE job.status_id = 1 GROUP BY job.job_id ORDER BY job.job_created_at DESC`);
    return rows;
  }

  const conditions = ["job.status_id = 1"];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      job.job_name LIKE ? OR 
      job.job_location LIKE ? OR 
      job.job_link LIKE ? OR
      job_type.job_type_name LIKE ? OR 
      ipk.ipk_no LIKE ? OR 
      company.company_name LIKE ? OR 
      user.user_fullname LIKE ? OR
      city.city_name LIKE ? OR 
      country.country_name LIKE ? OR
      education.education_name LIKE ? OR 
      experience.experience_name LIKE ? OR 
      gender.gender_name LIKE ? OR
      marital_status.marital_status_name LIKE ? OR 
      mode.mode_name LIKE ? OR 
      position.position_name LIKE ? OR
      program_study.program_study_name LIKE ? OR 
      province.province_name LIKE ? OR 
      religion.religion_name LIKE ?
    )`);
    values.push(...Array(18).fill(keyword));
  }

  // Numeric filters
  const numericFilters = ["job_salary_min", "job_salary_max"];
  for (const field of numericFilters) {
    if (field === "job_salary_min" && filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} >= ?`);
      values.push(filters[field]);
    } else if (field === "job_salary_max" && filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} <= ?`);
      values.push(filters[field]);
    } else if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`job.${field} = ?`);
      values.push(filters[field]);
    }
  }

  // Date filters
  const dateFilters = ["job_open_date", "job_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`job.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  // Direct filters
  const directFilters = ["age_min_id", "age_max_id", "weight_min_id", "weight_max_id", "height_min_id", "height_max_id", "job_type_id", "ipk_id", "company_id", "user_id", "status_id"];

  for (const field of directFilters) {
    const value = filters[field];
    if (value !== undefined && value !== "") {
      if (field === "age_min_id") {
        conditions.push(`age_min.age_no >= (SELECT age_no FROM tb_ages WHERE age_id = ?)`);
      } else if (field === "age_max_id") {
        conditions.push(`age_max.age_no <= (SELECT age_no FROM tb_ages WHERE age_id = ?)`);
      } else if (field === "weight_min_id") {
        conditions.push(`weight_min.weight_no >= (SELECT weight_no FROM tb_weights WHERE weight_id = ?)`);
      } else if (field === "weight_max_id") {
        conditions.push(`weight_max.weight_no <= (SELECT weight_no FROM tb_weights WHERE weight_id = ?)`);
      } else if (field === "height_min_id") {
        conditions.push(`height_min.height_no >= (SELECT height_no FROM tb_heights WHERE height_id = ?)`);
      } else if (field === "height_max_id") {
        conditions.push(`height_max.height_no <= (SELECT height_no FROM tb_heights WHERE height_id = ?)`);
      } else if (field === "ipk_id") {
        conditions.push(`ipk.ipk_no >= (SELECT ipk_no FROM tb_ipks WHERE ipk_id = ?)`);
      } else {
        conditions.push(`job.${field} = ?`);
      }
      values.push(value);
    }
  }

  // Base where
  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY job.job_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS jobs`;

  // Multi-select filters
  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "country_id", "education_id", "experience_id", "gender_id", "marital_status_id", "mode_id", "position_id", "program_study_id", "province_id", "religion_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, jobs.${alias})`);
      postValues.push(filters[field]);
    }
  }

  // Final where
  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...numericFilters, ...dateFilters, ...directFilters, ...multiSelectFilters, "job_views", "job_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      // Khusus sorting by job_views atau job_created_at tanpa total_relations
      if (field === "job_views" || field === "job_created_at") {
        orderBy = `ORDER BY jobs.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY jobs.total_relations ASC, jobs.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  console.log(finalQuery);
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}

// GET JOB SUMMARY
export async function getJobSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total_all,
      COUNT(CASE WHEN status_id = 1 THEN 1 END) AS total_status_1,
      COUNT(CASE WHEN status_id = 2 THEN 1 END) AS total_status_2
    FROM tb_jobs
  `);
  return rows[0];
}
