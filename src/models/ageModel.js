import db from "../configs/database.js";

// CREATE
export async function createAge(age) {
  const connection = await db.getConnection();
  const { age_no } = age;
  try {
    await connection.beginTransaction();
    const query = `
                  INSERT INTO tb_ages (
                                        age_no      
                                      ) 
                  VALUES (?)`;
    const values = [age_no];
    const [res] = await connection.query(query, values);
    const age_id = res.insertId;
    await connection.commit();
    return { age_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getAgeAll() {
  const [rows] = await db.query(getAgeBaseQuery() + ` GROUP BY age_id ORDER BY age_id ASC`);
  return rows;
}

// READ BY ID
export async function getAgeById(age_id) {
  const [rows] = await db.query(getAgeBaseQuery() + ` WHERE age_id = ? GROUP BY age_id`, [age_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateAgeById(age_id, age) {
  const connection = await db.getConnection();
  const { age_no } = age;
  try {
    await connection.beginTransaction();
    const query = `
                  UPDATE tb_ages SET
                                      age_no = ?, age_created_at = CURRENT_TIMESTAMP()
                  WHERE age_id = ?`;
    const values = [age_no, age_id];
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
export async function deleteAgeById(age_id) {
  const [result] = await db.query(`DELETE FROM tb_ages WHERE age_id = ?`, [age_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getAgeBaseQuery() {
  return `
          SELECT
                  age_id, age_no, age_created_at
          FROM tb_ages
        `;
}

// ============================================================================================================================================

// READ BY NO
export async function getAgeByNo(age_no) {
  const [rows] = await db.query(getAgeBaseQuery() + ` WHERE age_no = ? GROUP BY age_no`, [age_no]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortAges({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getAgeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY age_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY age_id ORDER BY age_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        age_no LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY age_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["age_no", "age_created_at", "age_updated_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "age_no" || field === "age_created_at" || field === "age_updated_at") {
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
