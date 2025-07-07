import db from "../configs/database.js";

// CREATE
export async function createStatus(status) {
  const connection = await db.getConnection();
  const { status_name } = status;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_statuses (
        status_name     
      ) VALUES (?)`;
    const values = [status_name];
    const [res] = await connection.query(query, values);
    const status_id = res.insertId;
    await connection.commit();
    return { status_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getStatusAll() {
  const [rows] = await db.query(
    getStatusBaseQuery() +
      `
GROUP BY status_id
ORDER BY status_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getStatusById(status_id) {
  const [rows] = await db.query(getStatusBaseQuery() + ` WHERE status_id = ? GROUP BY status_id`, [status_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateStatusById(status_id, status) {
  const connection = await db.getConnection();
  const { status_name } = status;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_statuses SET
                      status_name = ?, status_created_at = CURRENT_TIMESTAMP()
                  WHERE status_id = ?`;
    const values = [status_name, status_id];
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
export async function deleteStatusById(status_id) {
  const [result] = await db.query(`DELETE FROM tb_statuses WHERE status_id = ?`, [status_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getStatusBaseQuery() {
  return `
  SELECT
    status_id, status_name, status_created_at

  FROM tb_statuses
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getStatusByName(status_name) {
  const [rows] = await db.query(getStatusBaseQuery() + ` WHERE status_name = ? GROUP BY status_name`, [status_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortStatuses({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getStatusBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY status_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY status_id ORDER BY status_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        status_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY status_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["status_name", "status_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "status_name" || field === "status_created_at") {
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
