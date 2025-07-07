import db from "../configs/database.js";

// CREATE
export async function createHeight(height) {
  const connection = await db.getConnection();
  const { height_no } = height;
  try {
    await connection.beginTransaction();
    const query = `
                  INSERT INTO tb_heights (
                                        height_no      
                                      ) 
                  VALUES (?)`;
    const values = [height_no];
    const [res] = await connection.query(query, values);
    const height_id = res.insertId;
    await connection.commit();
    return { height_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getHeightAll() {
  const [rows] = await db.query(getHeightBaseQuery() + ` GROUP BY height_id ORDER BY height_id ASC`);
  return rows;
}

// READ BY ID
export async function getHeightById(height_id) {
  const [rows] = await db.query(getHeightBaseQuery() + ` WHERE height_id = ? GROUP BY height_id`, [height_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateHeightById(height_id, height) {
  const connection = await db.getConnection();
  const { height_no } = height;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_heights SET
                                      height_no = ?, height_created_at = CURRENT_TIMESTAMP()
                  WHERE height_id = ?`;
    const values = [height_no, height_id];
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
export async function deleteHeightById(height_id) {
  const [result] = await db.query(`DELETE FROM tb_heights WHERE height_id = ?`, [height_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getHeightBaseQuery() {
  return `
          SELECT
                  height_id, height_no, height_created_at
          FROM tb_heights
        `;
}

// ============================================================================================================================================

// READ BY NO
export async function getHeightByNo(height_no) {
  const [rows] = await db.query(getHeightBaseQuery() + ` WHERE height_no = ? GROUP BY height_no`, [height_no]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortHeights({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getHeightBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY height_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY height_id ORDER BY height_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        height_no LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY height_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["height_no", "height_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "height_no" || field === "height_created_at") {
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
