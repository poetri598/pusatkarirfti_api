import db from "../configs/database.js";
import { allowedPivotTables } from "../utils/pivotTables.js";

// Refresh pivot tables
async function refreshPivot(conn, table, column, expo_id, ids = [], entity = "expos") {
  const allowedTablesForEntity = allowedPivotTables[entity] || [];
  if (!allowedTablesForEntity.includes(table)) {
    throw new Error(`"${table}" pada "${entity}" tidak ditemukan`);
  }
  if (!Array.isArray(ids)) {
    ids = typeof ids === "string" ? ids.split(",").map((v) => Number(v.trim())) : [];
  }
  await conn.query(`DELETE FROM ?? WHERE expo_id = ?`, [table, expo_id]);
  if (ids.length) {
    const rows = ids.map((v) => [expo_id, v]);
    await conn.query(`INSERT INTO ?? (expo_id, ??) VALUES ?`, [table, column, rows]);
  }
}

// CREATE
export async function createExpo(expo) {
  const connection = await db.getConnection();
  const {
    expo_img,
    expo_name,
    expo_slug,
    expo_desc,
    expo_price,
    expo_location,
    expo_link,
    expo_date,
    expo_open_date,
    expo_close_date,
    user_id,
    status_id,
    city_ids = [],
    company_ids = [],
    country_ids = [],
    education_ids = [],
    expo_type_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
  } = expo;
  try {
    await connection.beginTransaction();
    const query = `
                    INSERT INTO tb_expos (
                                            expo_img, 
                                            expo_name, 
                                            expo_slug,  
                                            expo_desc, 
                                            expo_price, 
                                            expo_location, 
                                            expo_link, 
                                            expo_date, 
                                            expo_open_date, 
                                            expo_close_date, 
                                            user_id,
                                            status_id
                                          ) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [expo_img, expo_name, expo_slug, expo_desc, expo_price, expo_location, expo_link, expo_date, expo_open_date, expo_close_date, user_id, status_id];
    const [res] = await connection.query(query, values);
    const expo_id = res.insertId;
    await Promise.all([
      refreshPivot(connection, "tb_expos_cities", "city_id", expo_id, city_ids, "expos"),
      refreshPivot(connection, "tb_expos_companies", "company_id", expo_id, company_ids, "expos"),
      refreshPivot(connection, "tb_expos_countries", "country_id", expo_id, country_ids, "expos"),
      refreshPivot(connection, "tb_expos_educations", "education_id", expo_id, education_ids, "expos"),
      refreshPivot(connection, "tb_expos_expo_types", "expo_type_id", expo_id, expo_type_ids, "expos"),
      refreshPivot(connection, "tb_expos_modes", "mode_id", expo_id, mode_ids, "expos"),
      refreshPivot(connection, "tb_expos_positions", "position_id", expo_id, position_ids, "expos"),
      refreshPivot(connection, "tb_expos_program_studies", "program_study_id", expo_id, program_study_ids, "expos"),
      refreshPivot(connection, "tb_expos_provinces", "province_id", expo_id, province_ids, "expos"),
    ]);
    await connection.commit();
    return { expo_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getExpoAll() {
  const [rows] = await db.query(getExpoBaseQuery() + ` WHERE status.status_id = 1 GROUP BY expo.expo_id ORDER BY expo.expo_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getExpoById(expo_id) {
  const [rows] = await db.query(getExpoBaseQuery() + ` WHERE expo.expo_id = ? GROUP BY expo.expo_id`, [expo_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateExpoById(expo_id, expo) {
  const connection = await db.getConnection();
  const {
    expo_img,
    expo_name,
    expo_slug,
    expo_desc,
    expo_price,
    expo_location,
    expo_link,
    expo_date,
    expo_open_date,
    expo_close_date,
    user_id,
    status_id,
    city_ids = [],
    company_ids = [],
    country_ids = [],
    education_ids = [],
    expo_type_ids = [],
    mode_ids = [],
    position_ids = [],
    program_study_ids = [],
    province_ids = [],
  } = expo;
  try {
    await connection.beginTransaction();

    const query = `UPDATE tb_expos SET
                                        expo_img = ?, 
                                        expo_name = ?, 
                                        expo_slug = ?, 
                                        expo_desc = ?, 
                                        expo_price = ?,
                                        expo_location = ?, 
                                        expo_link = ?, 
                                        expo_date = ?, 
                                        expo_open_date = ?, 
                                        expo_close_date = ?, 
                                        expo_created_at = CURRENT_TIMESTAMP(),
                                        user_id = ?, 
                                        status_id = ?
                  WHERE expo_id = ?`;
    const values = [expo_img, expo_name, expo_slug, expo_desc, expo_price, expo_location, expo_link, expo_date, expo_open_date, expo_close_date, user_id, status_id, expo_id];
    await connection.query(query, values);
    await Promise.all([
      refreshPivot(connection, "tb_expos_cities", "city_id", expo_id, city_ids, "expos"),
      refreshPivot(connection, "tb_expos_companies", "company_id", expo_id, company_ids, "expos"),
      refreshPivot(connection, "tb_expos_countries", "country_id", expo_id, country_ids, "expos"),
      refreshPivot(connection, "tb_expos_educations", "education_id", expo_id, education_ids, "expos"),
      refreshPivot(connection, "tb_expos_expo_types", "expo_type_id", expo_id, expo_type_ids, "expos"),
      refreshPivot(connection, "tb_expos_modes", "mode_id", expo_id, mode_ids, "expos"),
      refreshPivot(connection, "tb_expos_positions", "position_id", expo_id, position_ids, "expos"),
      refreshPivot(connection, "tb_expos_program_studies", "program_study_id", expo_id, program_study_ids, "expos"),
      refreshPivot(connection, "tb_expos_provinces", "province_id", expo_id, province_ids, "expos"),
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
export async function deleteExpoById(expo_id) {
  const [result] = await db.query(`DELETE FROM tb_expos WHERE expo_id = ?`, [expo_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getExpoBaseQuery() {
  return `
  SELECT
    expo.expo_id,
    expo.expo_img,
    expo.expo_name,
    expo.expo_slug,
    expo.expo_desc,
    expo.expo_price,
    expo.expo_views,
    expo.expo_location,
    expo.expo_link,
    expo.expo_date,
    expo.expo_open_date,
    expo.expo_close_date,
    expo.expo_created_at,
    expo.user_id,
    user.user_img,
    user.user_fullname,
    user.role_id,
    role.role_name,
    expo.status_id,
    status.status_name,


    GROUP_CONCAT(DISTINCT city.city_id)              AS city_ids,
    GROUP_CONCAT(DISTINCT city.city_name)              AS city_names,
    GROUP_CONCAT(DISTINCT company.company_id)          AS company_ids,
    GROUP_CONCAT(DISTINCT company.company_name)          AS company_names,
    GROUP_CONCAT(DISTINCT country.country_id)           AS country_ids,
    GROUP_CONCAT(DISTINCT country.country_name)           AS country_names,
    GROUP_CONCAT(DISTINCT education.education_id)        AS education_ids,
    GROUP_CONCAT(DISTINCT education.education_name)        AS education_names,
    GROUP_CONCAT(DISTINCT expo_type.expo_type_id)    AS expo_type_ids,
    GROUP_CONCAT(DISTINCT expo_type.expo_type_name)    AS expo_type_names,
    GROUP_CONCAT(DISTINCT mode.mode_id)              AS mode_ids,
    GROUP_CONCAT(DISTINCT mode.mode_name)              AS mode_names,
    GROUP_CONCAT(DISTINCT position.position_id)         AS position_ids,
    GROUP_CONCAT(DISTINCT position.position_name)         AS position_names,
    GROUP_CONCAT(DISTINCT program_study.program_study_id)  AS program_study_ids,
    GROUP_CONCAT(DISTINCT program_study.program_study_name)  AS program_study_names,
    GROUP_CONCAT(DISTINCT province.province_id)           AS province_ids,
    GROUP_CONCAT(DISTINCT province.province_name)           AS province_names,


    (
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT city.city_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT company.company_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT company.company_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT country.country_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT education.education_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT expo_type.expo_type_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT expo_type.expo_type_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT mode.mode_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT position.position_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT program_study.program_study_id), ''), ',', ''))) +
      (LENGTH(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), '')) - LENGTH(REPLACE(IFNULL(GROUP_CONCAT(DISTINCT province.province_id), ''), ',', ''))) 
    ) AS total_relations

FROM tb_expos expo

#SINGLE
LEFT JOIN tb_statuses status ON expo.status_id = status.status_id
LEFT JOIN tb_users user ON expo.user_id = user.user_id
LEFT JOIN tb_roles role ON user.role_id = role.role_id


#MULTIPLE
LEFT JOIN tb_expos_cities expo_city ON expo.expo_id = expo_city.expo_id
LEFT JOIN tb_cities city ON expo_city.city_id = city.city_id

LEFT JOIN tb_expos_companies expo_company ON expo.expo_id = expo_company.expo_id
LEFT JOIN tb_companies company ON expo_company.company_id = company.company_id

LEFT JOIN tb_expos_countries expo_country ON expo.expo_id = expo_country.expo_id
LEFT JOIN tb_countries country ON expo_country.country_id= country.country_id

LEFT JOIN tb_expos_educations expo_education ON expo.expo_id = expo_education.expo_id
LEFT JOIN tb_educations education ON expo_education.education_id = education.education_id

LEFT JOIN tb_expos_expo_types expo_expo_type ON expo.expo_id = expo_expo_type.expo_id
LEFT JOIN tb_expo_types expo_type ON expo_expo_type.expo_type_id = expo_type.expo_type_id

LEFT JOIN tb_expos_modes expo_mode ON expo.expo_id = expo_mode.expo_id
LEFT JOIN tb_modes mode ON expo_mode.mode_id = mode.mode_id

LEFT JOIN tb_expos_positions expo_position ON expo.expo_id = expo_position.expo_id
LEFT JOIN tb_positions position ON expo_position.position_id = position.position_id

LEFT JOIN tb_expos_program_studies expo_program_study ON expo.expo_id = expo_program_study.expo_id
LEFT JOIN tb_program_studies program_study ON expo_program_study.program_study_id = program_study.program_study_id

LEFT JOIN tb_expos_provinces expo_province ON expo.expo_id = expo_province.expo_id
LEFT JOIN tb_provinces province ON expo_province.province_id = province.province_id
  `;
}

// ===========================================================================================================================================

// READ BY SLUG
export async function getExpoBySlug(expo_slug) {
  const [rows] = await db.query(getExpoBaseQuery() + ` WHERE expo.expo_slug = ? GROUP BY expo.expo_id`, [expo_slug]);
  return rows[0];
}

// READ THREE LATEST
export async function getThreeLatestExpo() {
  const [rows] = await db.query(getExpoBaseQuery() + ` WHERE status.status_id = 1 GROUP BY expo.expo_id ORDER BY expo.expo_created_at DESC LIMIT 3`);
  return rows;
}

// READ ALL– EXCEPT SLUG
export async function getExpoAllExceptSlug(expo_slug) {
  const [rows] = await db.query(
    getExpoBaseQuery() +
      ` WHERE status.status_id = 1
        AND expo.expo_slug <> ?
        GROUP BY expo.expo_id
        ORDER BY RAND()
        LIMIT 3`,
    [expo_slug]
  );
  return rows;
}

// UPDATE VIEW
export async function incrementViewBySlug(expo_slug) {
  await db.query(`UPDATE tb_expos SET expo_views = expo_views + 1 WHERE expo_slug = ?`, [expo_slug]);
  const [rows] = await db.query(`SELECT expo_views FROM tb_expos WHERE expo_slug = ?`, [expo_slug]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortExpos({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getExpoBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY expos.expo_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY expo.expo_id ORDER BY expo.expo_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                      expo.expo_name LIKE ? OR 
                      expo.expo_price LIKE ? OR
                      expo.expo_location LIKE ? OR 
                      expo.expo_link LIKE ?  OR 
                      user.user_fullname LIKE ? OR 
                      city.city_name LIKE ? OR 
                      company.company_name LIKE ? OR
                      country.country_name LIKE ? OR 
                      education.education_name LIKE ? OR 
                      expo_tye.expo_type_name LIKE ? OR 
                      mode.mode_name LIKE ? OR 
                      position.position_name LIKE ? OR 
                      program_study.program_study_name LIKE ? OR 
                      province.province_name LIKE ?)`);
    values.push(...Array(14).fill(keyword));
  }

  const dateFilters = ["expo_date", "expo_open_date", "expo_close_date"];
  for (const field of dateFilters) {
    if (filters[field]) {
      conditions.push(`expo.${field} >= ?`);
      values.push(filters[field]);
    }
  }

  const directFilters = ["user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`expo.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const innerQuery = `${baseQuery} ${baseWhere} GROUP BY expo.expo_id`;
  const subquery = `SELECT * FROM (${innerQuery}) AS expos`;

  const postConditions = [];
  const postValues = [];
  const multiSelectFilters = ["city_id", "company_id", "country_id", "education_id", "expo_type_id", "mode_id", "position_id", "program_study_id", "province_id"];

  for (const field of multiSelectFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const alias = field.replace("_id", "") + "_ids";
      postConditions.push(`FIND_IN_SET(?, expos.${alias})`);
      postValues.push(filters[field]);
    }
  }

  const finalWhere = postConditions.length ? `WHERE ${postConditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...dateFilters, ...directFilters, ...multiSelectFilters, "expo_price", "expo_views", "expo_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      let alias = field.includes("_id") ? field : field;
      if (multiSelectFilters.includes(field)) {
        alias = `${field.replace("_id", "")}_ids`;
      }
      if (field === "expo_price" || field === "expo_views" || field === "expo_created_at") {
        orderBy = `ORDER BY expos.${alias} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY expos.total_relations ASC, expos.${alias} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${subquery} ${finalWhere} ${orderBy}`;
  const [rows] = await db.query(finalQuery, [...values, ...postValues]);
  return rows;
}
