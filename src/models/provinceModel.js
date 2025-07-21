import db from "../configs/database.js";

// CREATE
export async function createProvince(Province) {
  const connection = await db.getConnection();
  const { province_name } = Province;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_provinces (
        province_name     
      ) VALUES (?)`;
    const values = [province_name];
    const [res] = await connection.query(query, values);
    const province_id = res.insertId;
    await connection.commit();
    return { province_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getProvinceAll() {
  const [rows] = await db.query(
    getProvinceBaseQuery() +
      `
GROUP BY province_id
ORDER BY province_name ASC`
  );
  return rows;
}

// READ BY ID
export async function getProvinceById(province_id) {
  const [rows] = await db.query(getProvinceBaseQuery() + ` WHERE province_id = ? GROUP BY province_id`, [province_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateProvinceById(province_id, Province) {
  const connection = await db.getConnection();
  const { province_name } = Province;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_provinces SET
                      province_name = ?, province_created_at = CURRENT_TIMESTAMP()
                  WHERE province_id = ?`;

    const values = [province_name, province_id];

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
export async function deleteProvinceById(province_id) {
  const [result] = await db.query(`DELETE FROM tb_provinces WHERE province_id = ?`, [province_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getProvinceBaseQuery() {
  return `
  SELECT
    province_id, province_name, province_created_at

  FROM tb_provinces
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getProvinceByName(province_name) {
  const [rows] = await db.query(getProvinceBaseQuery() + ` WHERE province_name = ? GROUP BY province_name`, [province_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortProvinces({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getProvinceBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY province_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY province_id ORDER BY province_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        province_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY province_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["province_name", "province_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "province_name" || field === "province_created_at") {
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
