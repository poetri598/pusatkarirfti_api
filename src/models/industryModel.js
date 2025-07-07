import db from "../configs/database.js";

// CREATE
export async function createIndustry(industry) {
  const connection = await db.getConnection();
  const { industry_name } = industry;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_industries (
        industry_name        
      ) VALUES (?)`;
    const values = [industry_name];
    const [res] = await connection.query(query, values);
    const industry_id = res.insertId;
    await connection.commit();
    return { industry_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getIndustryAll() {
  const [rows] = await db.query(
    getIndustryBaseQuery() +
      `
GROUP BY industry_id
ORDER BY industry_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getIndustryById(industry_id) {
  const [rows] = await db.query(getIndustryBaseQuery() + ` WHERE industry_id = ? GROUP BY industry_id`, [industry_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateIndustryById(industry_id, industry) {
  const connection = await db.getConnection();
  const { industry_name } = industry;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_industries SET
                      industry_name = ?, industry_created_at = CURRENT_TIMESTAMP
                  WHERE industry_id = ?`;
    const values = [industry_name, industry_id];
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
export async function deleteIndustryById(industry_id) {
  const [result] = await db.query(`DELETE FROM tb_industries WHERE industry_id = ?`, [industry_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getIndustryBaseQuery() {
  return `
  SELECT
    industry_id,industry_name, industry_created_at

  FROM tb_industries
  `;
}

// ==============================================================================================================================================================

// READ BY NAME
export async function getIndustryByName(industry_name) {
  const [rows] = await db.query(getIndustryBaseQuery() + ` WHERE industry_name = ? GROUP BY industry_name`, [industry_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortIndustries({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getIndustryBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY industry_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY industry_id ORDER BY industry_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        industry_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY industry_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["industry_name", "industry_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "industry_name" || field === "industry_created_at") {
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
