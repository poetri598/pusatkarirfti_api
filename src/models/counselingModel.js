import db from "../configs/database.js";

// CREATE
export async function createCounseling(counseling) {
  const connection = await db.getConnection();
  const { counseling_date, counseling_desc, counseling_is_read, counseling_type_id, user_id, status_id } = counseling;
  try {
    await connection.beginTransaction();
    const query = `
                    INSERT INTO tb_counselings (
                                                  counseling_date,
                                                  counseling_desc,
                                                  counseling_is_read,
                                                  counseling_type_id, 
                                                  user_id, 
                                                  status_id
                                                ) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [counseling_date, counseling_desc, counseling_is_read, counseling_type_id, user_id, status_id];
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
  const { counseling_desc, counseling_type_id, counseling_date, counseling_is_read, status_id } = counseling;
  try {
    await connection.beginTransaction();
    const query = `
                    UPDATE tb_counselings SET 
                                              counseling_desc = ?, 
                                              counseling_type_id = ?, 
                                              counseling_date = ?,
                                              counseling_is_read = ?,
                                              status_id = ?
                    WHERE counseling_id = ?`;
    const values = [counseling_desc, counseling_type_id, counseling_date, counseling_is_read, status_id, counseling_id];
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
                  program_study.program_study_name,
                  user.semester_id,
                  semester.semester_no

            FROM tb_counselings counseling
            LEFT JOIN tb_statuses        status ON counseling.status_id      = status.status_id
            LEFT JOIN tb_counseling_types counseling_type ON counseling.counseling_type_id = counseling_type.counseling_type_id
            LEFT JOIN tb_users           user   ON counseling.user_id        = user.user_id
            LEFT JOIN tb_program_studies  program_study ON user.program_study_id = program_study.program_study_id
            LEFT JOIN tb_semesters       semester ON user.semester_id = semester.semester_id


  `;
}

// =====================================================================================================================================================

// READ ALL BY USERID
export async function getCounselingAllByUserId(user_id) {
  const [rows] = await db.query(getCounselingBaseQuery() + ` WHERE counseling.user_id = ?  GROUP BY counseling.counseling_id ORDER BY counseling.counseling_created_at DESC`, [user_id]);
  return rows;
}

// UPDATE IS_READ BY ID
export async function updateCounselingIsReadById(counseling_id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_counselings SET 
        counseling_is_read = 1
      WHERE counseling_id = ?`;
    const values = [counseling_id];
    await connection.query(query, values);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// UPDATE STATUS BY ID
export async function updateCounselingStatusById(counseling_id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_counselings SET 
        status_id = 1
      WHERE counseling_id = ?`;
    await connection.query(query, [counseling_id]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// COUNT UNREAD
export async function countUnreadCounselings() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total_unread
    FROM tb_counselings
    WHERE counseling_is_read = 0
  `);
  return rows[0].total_unread;
}

// COUNT UNAPPROVED
export async function countUnapprovedCounselings() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total_unapproved
    FROM tb_counselings
    WHERE status_id = 2
  `);
  return rows[0].total_unapproved;
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
    const [rows] = await db.query(`${baseQuery} GROUP BY counseling.counseling_id ORDER BY counseling.counseling_is_read ASC, counseling.counseling_created_at DESC`);
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

  // Direct Filters
  const directFilters = ["counseling_type_id", "counseling_is_read", "user_id", "program_study_id", "semester_id", "status_id"];

  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      if (field === "program_study_id" || field === "semester_id") {
        conditions.push(`user.${field} = ?`);
        values.push(filters[field]);
      } else {
        conditions.push(`counseling.${field} = ?`);
        values.push(filters[field]);
      }
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
