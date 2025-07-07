import db from "../configs/database.js";

// CREATE
export async function createMode(mode) {
  const connection = await db.getConnection();
  const { mode_name } = mode;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_modes (
        mode_name      
      ) VALUES (?)`;
    const values = [mode_name];
    const [res] = await connection.query(query, values);
    const mode_id = res.insertId;
    await connection.commit();
    return { mode_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getModeAll() {
  const [rows] = await db.query(
    getModeBaseQuery() +
      `
GROUP BY mode_id
ORDER BY mode_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getModeById(mode_id) {
  const [rows] = await db.query(getModeBaseQuery() + ` WHERE mode_id = ? GROUP BY mode_id`, [mode_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateModeById(mode_id, mode) {
  const connection = await db.getConnection();
  const { mode_name } = mode;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_modes SET
                      mode_name = ?, mode_created_at = CURRENT_TIMESTAMP()
                  WHERE mode_id = ?`;
    const values = [mode_name, mode_id];
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
export async function deleteModeById(mode_id) {
  const [result] = await db.query(`DELETE FROM tb_modes WHERE mode_id = ?`, [mode_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getModeBaseQuery() {
  return `
  SELECT
    mode_id,mode_name,mode_created_at

  FROM tb_modes
  `;
}

// ================================================================================================================================================

// READ BY NAME
export async function getModeByName(mode_name) {
  const [rows] = await db.query(getmodeBaseQuery() + ` WHERE mode_name = ? GROUP BY mode_name`, [mode_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortModes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getModeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY mode_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY mode_id ORDER BY mode_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        mode_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY mode_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["mode_name", "mode_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "mode_name" || field === "mode_created_at") {
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
