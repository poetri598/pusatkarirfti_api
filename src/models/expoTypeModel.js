import db from "../configs/database.js";

// CREATE
export async function createExpoType(expo_type) {
  const connection = await db.getConnection();
  const { expo_type_name } = expo_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_expo_types (
        expo_type_name        
      ) VALUES (?)`;
    const values = [expo_type_name];
    const [res] = await connection.query(query, values);
    const expo_type_id = res.insertId;
    await connection.commit();
    return { expo_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getExpoTypeAll() {
  const [rows] = await db.query(
    getExpoTypeBaseQuery() +
      `
GROUP BY expo_type_id
ORDER BY expo_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getExpoTypeById(expo_type_id) {
  const [rows] = await db.query(getExpoTypeBaseQuery() + ` WHERE expo_type_id = ? GROUP BY expo_type_id`, [expo_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateExpoTypeById(expo_type_id, expo_type) {
  const connection = await db.getConnection();
  const { expo_type_name } = expo_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_expo_types SET
                      expo_type_name = ?, expo_type_created_at = CURRENT_TIMESTAMP()
                  WHERE expo_type_id = ?`;
    const values = [expo_type_name, expo_type_id];
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
export async function deleteExpoTypeById(expo_type_id) {
  const [result] = await db.query(`DELETE FROM tb_expo_types WHERE expo_type_id = ?`, [expo_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getExpoTypeBaseQuery() {
  return `
  SELECT
    expo_type_id,expo_type_name, expo_type_created_at

  FROM tb_expo_types
  `;
}

// ==================================================================================================================================================

// READ BY NAME
export async function getExpoTypeByName(expo_type_name) {
  const [rows] = await db.query(getExpoTypeBaseQuery() + ` WHERE expo_type_name = ? GROUP BY expo_type_name`, [expo_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortExpoTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getExpoTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY expo_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY expo_type_id ORDER BY expo_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        expo_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY expo_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["expo_type_name", "expo_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "expo_type_name" || field === "expo_type_created_at") {
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
