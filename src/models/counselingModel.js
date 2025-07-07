import db from "../configs/database.js";

// CREATE
export async function createCounseling(counseling) {
  const connection = await db.getConnection();
  const { counseling_desc, user_id, counseling_type_id, counseling_date } = counseling;
  try {
    await connection.beginTransaction();
    const query = `
                    INSERT INTO tb_counselings (
                                                  counseling_desc,
                                                  user_id, 
                                                  counseling_type_id, 
                                                  counseling_date
                                                ) 
                    VALUES (?, ?, ?,?)`;
    const values = [counseling_desc, user_id, counseling_type_id, counseling_date];
    const [res] = await connection.query(query, values);
    const counseling_id = res.insertId;
    await connection.commit();
    return { counseling_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getCounselingAll() {
  const [rows] = await db.query(getCounselingBaseQuery() + ` WHERE status.status_id = 1 GROUP BY counseling.counseling_id ORDER BY counseling.counseling_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getCounselingById(counseling_id) {
  const [rows] = await db.query(getCounselingBaseQuery() + ` WHERE counseling.counseling_id = ? GROUP BY counseling.counseling_id`, [counseling_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateCounselingById(counseling_id, counseling) {
  const connection = await db.getConnection();
  const { counseling_desc, counseling_type_id, counseling_date } = counseling;
  try {
    await connection.beginTransaction();
    const query = `
                    UPDATE tb_counselings SET 
                                              counseling_desc = ?, 
                                              counseling_type_id = ?, 
                                              counseling_date = ?
                    WHERE counseling_id = ?`;
    const values = [counseling_desc, counseling_type_id, counseling_date, counseling_id];
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
export async function deleteCounselingById(counseling_id) {
  const [result] = await db.query(`DELETE FROM tb_counselings WHERE counseling_id = ?`, [counseling_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getCounselingBaseQuery() {
  return `
           SELECT
                  counseling.counseling_id,
                  counseling.counseling_date,
                  counseling.counseling_desc,
                  counseling.counseling_is_read,
                  counseling.counseling_created_at,
                  counseling.counseling_type_id,
                  counseling_type.counseling_type_name,
                  counseling.user_id,
                  user.user_img,
                  user.user_fullname,
                  user.user_phone,
                  user.user_nim,
                  counseling.status_id,
                  status.status_name,
                  user.program_study_id,
                  program_study.program_study_name

            FROM tb_counselings counseling
            LEFT JOIN tb_statuses        status ON counseling.status_id      = status.status_id
            LEFT JOIN tb_counseling_types counseling_type ON counseling.counseling_type_id = counseling_type.counseling_type_id
            LEFT JOIN tb_users           user   ON counseling.user_id        = user.user_id
            LEFT JOIN tb_program_studies  program_study ON user.program_study_id = program_study.program_study_id


  `;
}

// =====================================================================================================================================================

// READ ALL BY USERID
export async function getCounselingAllByUserId(user_id) {
  const [rows] = await db.query(getCounselingBaseQuery() + ` WHERE counseling.user_id = ?  GROUP BY counseling.counseling_id ORDER BY counseling.counseling_created_at DESC`, [user_id]);
  return rows;
}

// SEARCH FILTER SORT
export async function searchFilterSortCounselings({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getCounselingBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY counseling.counseling_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY counseling.counseling_id ORDER BY counseling.counseling_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      counseling.counseling_desc LIKE ? OR
      counseling_type.counseling_type_name LIKE ? OR
      user.user_fullname LIKE ? OR
      user.user_nim LIKE ? OR
      user.user_phone LIKE ?
    )`);
    values.push(...Array(5).fill(keyword));
  }

  // Filters
  const directFilters = ["counseling_is_read", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      const tablePrefix = field === "status_id" ? "status" : "counseling";
      conditions.push(`${tablePrefix}.${field} = ?`);
      values.push(filters[field]);
    }
  }

  // WHERE clause
  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere}`;

  // Sorting
  if (!isSortEmpty) {
    const [field, dir] = sort.split(":");
    const validSorts = [...directFilters, "counseling_created_at", "counseling_date"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      orderBy = `ORDER BY counseling.${field} ${dir.toUpperCase()}`;
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}
