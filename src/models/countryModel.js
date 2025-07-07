import db from "../configs/database.js";

// CREATE
export async function createCountry(country) {
  const connection = await db.getConnection();
  const { country_name } = country;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_countries (
        country_name        
      ) VALUES (?)`;
    const values = [country_name];
    const [res] = await connection.query(query, values);
    const country_id = res.insertId;
    await connection.commit();
    return { country_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getCountryAll() {
  const [rows] = await db.query(
    getCountryBaseQuery() +
      `
GROUP BY country_id
ORDER BY country_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getCountryById(country_id) {
  const [rows] = await db.query(getCountryBaseQuery() + ` WHERE country_id = ? GROUP BY country_id`, [country_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateCountryById(country_id, country) {
  const connection = await db.getConnection();
  const { country_name } = country;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_countries SET
                      country_name = ?, country_created_at = CURRENT_TIMESTAMP()
                  WHERE country_id = ?`;
    const values = [country_name, country_id];
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
export async function deleteCountryById(country_id) {
  const [result] = await db.query(`DELETE FROM tb_countries WHERE country_id = ?`, [country_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getCountryBaseQuery() {
  return `
  SELECT
    country_id,country_name, country_created_at

  FROM tb_countries
  `;
}

// ==========================================================================================================================================================

// READ BY Name
export async function getCountryByName(country_name) {
  const [rows] = await db.query(getCountryBaseQuery() + ` WHERE country_name = ? GROUP BY country_name`, [country_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortCountries({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getCountryBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY country_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY country_id ORDER BY country_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        country_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY country_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["country_name", "country_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "country_name" || field === "country_created_at") {
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
