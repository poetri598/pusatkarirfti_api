import db from "../configs/database.js";

// CREATE
export async function createPlatform(platform) {
  const connection = await db.getConnection();
  const { platform_name, platform_img } = platform;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_platforms (
        platform_name,
        platform_img
      ) VALUES (?, ?)`;
    const values = [platform_name, platform_img];
    const [res] = await connection.query(query, values);
    await connection.commit();
    return { platform_id: res.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getPlatformAll() {
  const [rows] = await db.query(getPlatformBaseQuery() + ` ORDER BY platform_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getPlatformById(platform_id) {
  const [rows] = await db.query(getPlatformBaseQuery() + ` WHERE platform_id = ?`, [platform_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updatePlatformById(platform_id, platform) {
  const connection = await db.getConnection();
  const { platform_name, platform_img } = platform;
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_platforms SET
        platform_name = ?,
        platform_img = ?,
        platform_updated_at = CURRENT_TIMESTAMP()
      WHERE platform_id = ?`;
    const values = [platform_name, platform_img, platform_id];
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
export async function deletePlatformById(platform_id) {
  const [result] = await db.query(`DELETE FROM tb_platforms WHERE platform_id = ?`, [platform_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getPlatformBaseQuery() {
  return `
    SELECT
      platform_id,
      platform_name,
      platform_img,
      platform_created_at,
      platform_updated_at
    FROM tb_platforms`;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getPlatformByName(platform_name) {
  const [rows] = await db.query(getPlatformBaseQuery() + ` WHERE platform_name = ?`, [platform_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortPlatforms({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getPlatformBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY platform_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY platform_id ORDER BY platform_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        platform_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY platform_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["platform_name", "platform_created_at", "platform_updated_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "platform_name" || field === "platform_created_at" || field === "platform_updated_at") {
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
