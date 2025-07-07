import db from "../configs/database.js";

// CREATE
export async function createMaritalStatus(marital_status) {
  const connection = await db.getConnection();
  const { marital_status_name } = marital_status;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_marital_statuses (
        marital_status_name        
      ) VALUES (?)`;
    const values = [marital_status_name];
    const [res] = await connection.query(query, values);
    const marital_status_id = res.insertId;
    await connection.commit();
    return { marital_status_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getMaritalStatusAll() {
  const [rows] = await db.query(
    getMaritalStatusBaseQuery() +
      `
GROUP BY marital_status_id
ORDER BY marital_status_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getMaritalStatusById(marital_status_id) {
  const [rows] = await db.query(getMaritalStatusBaseQuery() + ` WHERE marital_status_id = ? GROUP BY marital_status_id`, [marital_status_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateMaritalStatusById(marital_status_id, marital_status) {
  const connection = await db.getConnection();
  const { marital_status_name } = marital_status;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_marital_statuses SET
                      marital_status_name = ?, marital_status_created_at = CURRENT_TIMESTAMP()
                  WHERE marital_status_id = ?`;
    const values = [marital_status_name, marital_status_id];
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
export async function deleteMaritalStatusById(marital_status_id) {
  const [result] = await db.query(`DELETE FROM tb_marital_statuses WHERE marital_status_id = ?`, [marital_status_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getMaritalStatusBaseQuery() {
  return `
  SELECT
   marital_status_id, marital_status_name, marital_status_created_at

  FROM tb_marital_statuses
  `;
}

// =======================================================================================================================================================

// READ BY NAME
export async function getMaritalStatusByName(marital_status_name) {
  const [rows] = await db.query(getMaritalStatusBaseQuery() + ` WHERE marital_status_name = ? GROUP BY marital_status_name`, [marital_status_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortMaritalStatuses({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getMaritalStatusBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY marital_status_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY marital_status_id ORDER BY marital_status_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        marital_status_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY marital_status_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["marital_status_name", "marital_status_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "marital_status_name" || field === "marital_status_created_at") {
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
