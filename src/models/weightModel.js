import db from "../configs/database.js";

// CREATE
export async function createWeight(weight) {
  const connection = await db.getConnection();
  const { weight_no } = weight;
  try {
    await connection.beginTransaction();
    const query = `
                  INSERT INTO tb_weights (
                                        weight_no      
                                      ) 
                  VALUES (?)`;
    const values = [weight_no];
    const [res] = await connection.query(query, values);
    const weight_id = res.insertId;
    await connection.commit();
    return { weight_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getWeightAll() {
  const [rows] = await db.query(getWeightBaseQuery() + ` GROUP BY weight_id ORDER BY weight_id ASC`);
  return rows;
}

// READ BY ID
export async function getWeightById(weight_id) {
  const [rows] = await db.query(getWeightBaseQuery() + ` WHERE weight_id = ? GROUP BY weight_id`, [weight_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateWeightById(weight_id, weight) {
  const connection = await db.getConnection();
  const { weight_no } = weight;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_weights SET
                                      weight_no = ?, weight_created_at = CURRENT_TIMESTAMP()
                  WHERE weight_id = ?`;
    const values = [weight_no, weight_id];
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
export async function deleteWeightById(weight_id) {
  const [result] = await db.query(`DELETE FROM tb_weights WHERE weight_id = ?`, [weight_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getWeightBaseQuery() {
  return `
          SELECT
                  weight_id, weight_no, weight_created_at
          FROM tb_weights
        `;
}

// ============================================================================================================================================

// READ BY NO
export async function getWeightByNo(weight_no) {
  const [rows] = await db.query(getWeightBaseQuery() + ` WHERE weight_no = ? GROUP BY weight_no`, [weight_no]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortWeights({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getWeightBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY weight_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY weight_id ORDER BY weight_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        weight_no LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY weight_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["weight_no", "weight_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "weight_no" || field === "weight_created_at") {
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
