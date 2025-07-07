import db from "../configs/database.js";

// CREATE
export async function createNewsType(news_type) {
  const connection = await db.getConnection();
  const { news_type_name } = news_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_news_types (
        news_type_name        
      ) VALUES (?)`;
    const values = [news_type_name];
    const [res] = await connection.query(query, values);
    const news_type_id = res.insertId;
    await connection.commit();
    return { news_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getNewsTypeAll() {
  const [rows] = await db.query(
    getNewsTypeBaseQuery() +
      `
GROUP BY news_type_id
ORDER BY news_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getNewsTypeById(news_type_id) {
  const [rows] = await db.query(getNewsTypeBaseQuery() + ` WHERE news_type_id = ? GROUP BY news_type_id`, [news_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateNewsTypeById(news_type_id, news_type) {
  const connection = await db.getConnection();
  const { news_type_name } = news_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_news_types SET
                      news_type_name = ?, news_type_created_at = CURRENT_TIMESTAMP()
                  WHERE news_type_id = ?`;
    const values = [news_type_name, news_type_id];
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
export async function deleteNewsTypeById(news_type_id) {
  const [result] = await db.query(`DELETE FROM tb_news_types WHERE news_type_id = ?`, [news_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getNewsTypeBaseQuery() {
  return `
  SELECT
    news_type_id,news_type_name, news_type_created_at

  FROM tb_news_types
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getNewsTypeByName(news_type_name) {
  const [rows] = await db.query(getNewsTypeBaseQuery() + ` WHERE news_type_name = ? GROUP BY news_type_name`, [news_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortNewsTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getNewsTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY news_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY news_type_id ORDER BY news_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        news_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY news_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["news_type_name", "news_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "news_type_name" || field === "news_type_created_at") {
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
