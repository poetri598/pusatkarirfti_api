import db from "../configs/database.js";

// CREATE
export async function createSemester(semester) {
  const connection = await db.getConnection();
  const { semester_no } = semester;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_Semesters (
        semester_no      
      ) VALUES ( ?)`;
    const values = [semester_no];
    const [res] = await connection.query(query, values);
    const semester_id = res.insertId;
    await connection.commit();
    return { semester_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getSemesterAll() {
  const [rows] = await db.query(
    getSemesterBaseQuery() +
      `
GROUP BY semester_id
ORDER BY semester_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getSemesterById(semester_id) {
  const [rows] = await db.query(getSemesterBaseQuery() + ` WHERE semester_id = ? GROUP BY semester_id`, [semester_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateSemesterById(semester_id, semester) {
  const connection = await db.getConnection();
  const { semester_no } = semester;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_semesters SET
                      semester_no = ?, semester_created_at = CURRENT_TIMESTAMP()
                  WHERE semester_id = ?`;
    const values = [semester_no, semester_id];
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
export async function deleteSemesterById(semester_id) {
  const [result] = await db.query(`DELETE FROM tb_semesters WHERE semester_id = ?`, [semester_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getSemesterBaseQuery() {
  return `
  SELECT
    semester_id, semester_no,semester_created_at

  FROM tb_semesters
  `;
}

//==============================================================================================================================================================

// READ BY NO
export async function getSemesterByNo(semester_no) {
  const [rows] = await db.query(getSemesterBaseQuery() + ` WHERE semester_no = ? GROUP BY semester_no`, [semester_no]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortSemesters({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getSemesterBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY semester_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY semester_id ORDER BY semester_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        semester_no LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY semester_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["semester_no", "semester_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "semester_no" || field === "semester_created_at") {
        orderBy = `ORDER BY ${field} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY ${field} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}
