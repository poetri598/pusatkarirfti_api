import db from "../configs/database.js";

// CREATE
export async function createCity(city) {
  const connection = await db.getConnection();
  const { city_name } = city;
  try {
    await connection.beginTransaction();
    const query = `
                    INSERT INTO tb_cities (
                                            city_name        
                                          ) 
                    VALUES (?)`;
    const values = [city_name];
    const [res] = await connection.query(query, values);
    const city_id = res.insertId;
    await connection.commit();
    return { city_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getCityAll() {
  const [rows] = await db.query(getCityBaseQuery() + ` GROUP BY city_id ORDER BY city_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getCityById(city_id) {
  const [rows] = await db.query(getCityBaseQuery() + ` WHERE city_id = ? GROUP BY city_id`, [city_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateCityById(city_id, city) {
  const connection = await db.getConnection();
  const { city_name } = city;
  try {
    await connection.beginTransaction();
    const query = ` 
                    UPDATE tb_cities SET
                                          city_name = ?, 
                                          city_created_at = CURRENT_TIMESTAMP()
                    WHERE city_id = ?`;
    const values = [city_name, city_id];
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
export async function deleteCityById(city_id) {
  const [result] = await db.query(`DELETE FROM tb_cities WHERE city_id = ?`, [city_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getCityBaseQuery() {
  return `
  SELECT
    city_id, city_name, city_created_at
  FROM tb_cities
  `;
}

// ===========================================================================================================================================================

// READ BY Name
export async function getCityByName(city_name) {
  const [rows] = await db.query(getCityBaseQuery() + ` WHERE city_name = ? GROUP BY city_name`, [city_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortCities({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getCityBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY city_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY city_id ORDER BY city_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        city_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY city_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["city_name", "city_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "city_name" || field === "city_created_at") {
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
