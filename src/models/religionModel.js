import db from "../configs/database.js";

// CREATE
export async function createReligion(religion) {
  const connection = await db.getConnection();
  const { religion_name } = religion;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_religions (
        religion_name     
      ) VALUES (?)`;
    const values = [religion_name];
    const [res] = await connection.query(query, values);
    const religion_id = res.insertId;
    await connection.commit();
    return { religion_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getReligionAll() {
  const [rows] = await db.query(
    getReligionBaseQuery() +
      `
GROUP BY religion_id
ORDER BY religion_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getReligionById(religion_id) {
  const [rows] = await db.query(getReligionBaseQuery() + ` WHERE religion_id = ? GROUP BY religion_id`, [religion_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateReligionById(religion_id, Religion) {
  const connection = await db.getConnection();
  const { religion_name } = Religion;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_religions SET
                      religion_name = ?, religion_created_at = CURRENT_TIMESTAMP()
                  WHERE religion_id = ?`;
    const values = [religion_name, religion_id];
    await connection.query(query, values);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE
export async function deleteReligionById(religion_id) {
  const [result] = await db.query(`DELETE FROM tb_religions WHERE religion_id = ?`, [religion_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getReligionBaseQuery() {
  return `
  SELECT
    religion_id, religion_name, religion_created_at

  FROM tb_religions
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getReligionByName(religion_name) {
  const [rows] = await db.query(getReligionBaseQuery() + ` WHERE religion_name = ? GROUP BY religion_name`, [religion_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortReligions({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getReligionBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY religion_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY religion_id ORDER BY religion_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        religion_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY religion_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["religion_name", "religion_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "religion_name" || field === "religion_created_at") {
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
