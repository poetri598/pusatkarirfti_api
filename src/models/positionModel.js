import db from "../configs/database.js";

// CREATE
export async function createPosition(position) {
  const connection = await db.getConnection();
  const { position_name } = position;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_positions (
        position_name      
      ) VALUES (?)`;
    const values = [position_name];
    const [res] = await connection.query(query, values);
    const position_id = res.insertId;
    await connection.commit();
    return { position_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getPositionAll() {
  const [rows] = await db.query(
    getPositionBaseQuery() +
      `
GROUP BY position_id
ORDER BY position_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getPositionById(position_id) {
  const [rows] = await db.query(getPositionBaseQuery() + ` WHERE position_id = ? GROUP BY position_id`, [position_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updatePositionById(position_id, position) {
  const connection = await db.getConnection();
  const { position_name } = position;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_positions SET
                      position_name = ?, position_created_at = CURRENT_TIMESTAMP()
                  WHERE position_id = ?`;
    const values = [position_name, position_id];
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
export async function deletePositionById(position_id) {
  const [result] = await db.query(`DELETE FROM tb_positions WHERE position_id = ?`, [position_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getPositionBaseQuery() {
  return `
  SELECT
    position_id, position_name, position_created_at

  FROM tb_positions
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getPositionByName(position_name) {
  const [rows] = await db.query(getPositionBaseQuery() + ` WHERE position_name = ? GROUP BY position_name`, [position_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortPositions({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getPositionBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY position_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY position_id ORDER BY position_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        position_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY position_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["position_name", "position_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "position_name" || field === "position_created_at") {
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
