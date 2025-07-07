import db from "../configs/database.js";

// CREATE
export async function createCounselingType(counseling_type) {
  const connection = await db.getConnection();
  const { counseling_type_name } = counseling_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_counseling_types (
        counseling_type_name        
      ) VALUES (?)`;
    const values = [counseling_type_name];
    const [res] = await connection.query(query, values);
    const counseling_type_id = res.insertId;
    await connection.commit();
    return { counseling_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getCounselingTypeAll() {
  const [rows] = await db.query(
    getCounselingTypeBaseQuery() +
      `
GROUP BY counseling_type_id
ORDER BY counseling_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getCounselingTypeById(counseling_type_id) {
  const [rows] = await db.query(getCounselingTypeBaseQuery() + ` WHERE counseling_type_id = ? GROUP BY counseling_type_id`, [counseling_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateCounselingTypeById(counseling_type_id, counseling_type) {
  const connection = await db.getConnection();
  const { counseling_type_name } = counseling_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_counseling_types SET
                      counseling_type_name = ?, counseling_type_created_at = CURRENT_TIMESTAMP()
                  WHERE counseling_type_id = ?`;
    const values = [counseling_type_name, counseling_type_id];
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
export async function deleteCounselingTypeById(counseling_type_id) {
  const [result] = await db.query(`DELETE FROM tb_counseling_types WHERE counseling_type_id = ?`, [counseling_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getCounselingTypeBaseQuery() {
  return `
  SELECT
          counseling_type_id,
          counseling_type_name, 
          counseling_type_created_at
  FROM tb_counseling_types
  `;
}

// ==================================================================================================================================================

// READ BY NAME
export async function getCounselingTypeByName(counseling_type_name) {
  const [rows] = await db.query(getCounselingTypeBaseQuery() + ` WHERE counseling_type_name = ? GROUP BY counseling_type_name`, [counseling_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortCounselingTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getCounselingTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY counseling_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY counseling_type_id ORDER BY counseling_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        counseling_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY counseling_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["counseling_type_name", "counseling_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "counseling_type_name" || field === "counseling_type_created_at") {
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
