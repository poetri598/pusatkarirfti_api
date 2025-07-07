import db from "../configs/database.js";

// CREATE
export async function createGender(gender) {
  const connection = await db.getConnection();
  const { gender_name } = gender;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_genders (
        gender_name      
      ) VALUES (?)`;
    const values = [gender_name];
    const [res] = await connection.query(query, values);
    const gender_id = res.insertId;
    await connection.commit();
    return { gender_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getGenderAll() {
  const [rows] = await db.query(
    getGenderBaseQuery() +
      `
GROUP BY gender_id
ORDER BY gender_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getGenderById(gender_id) {
  const [rows] = await db.query(getGenderBaseQuery() + ` WHERE gender_id = ? GROUP BY gender_id`, [gender_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateGenderById(gender_id, gender) {
  const connection = await db.getConnection();
  const { gender_name } = gender;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_genders SET
                      gender_name = ?, gender_created_at = CURRENT_TIMESTAMP()
                  WHERE gender_id = ?`;
    const values = [gender_name, gender_id];
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
export async function deleteGenderById(gender_id) {
  const [result] = await db.query(`DELETE FROM tb_genders WHERE gender_id = ?`, [gender_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getGenderBaseQuery() {
  return `
  SELECT
    gender_id, gender_name, gender_created_at

  FROM tb_genders
  `;
}

// ============================================================================================================================================================

// READ BY NAME
export async function getGenderByName(gender_name) {
  const [rows] = await db.query(getGenderBaseQuery() + ` WHERE gender_name = ? GROUP BY gender_name`, [gender_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortGenders({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getGenderBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY gender_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY gender_id ORDER BY gender_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        gender_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY gender_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["gender_name", "gender_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "gender_name" || field === "gender_created_at") {
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
