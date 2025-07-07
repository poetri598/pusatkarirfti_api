import db from "../configs/database.js";

// CREATE
export async function createEducation(education) {
  const connection = await db.getConnection();
  const { education_name } = education;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_educations (
        education_name        
      ) VALUES (?)`;
    const values = [education_name];
    const [res] = await connection.query(query, values);
    const education_id = res.insertId;
    await connection.commit();
    return { education_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getEducationAll() {
  const [rows] = await db.query(
    getEducationBaseQuery() +
      `
GROUP BY education_id
ORDER BY education_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getEducationById(education_id) {
  const [rows] = await db.query(getEducationBaseQuery() + ` WHERE education_id = ? GROUP BY education_id`, [education_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateEducationById(education_id, education) {
  const connection = await db.getConnection();
  const { education_name } = education;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_educations SET
                      education_name = ?, education_created_at = CURRENT_TIMESTAMP()
                  WHERE education_id = ?`;
    const values = [education_name, education_id];
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
export async function deleteEducationById(education_id) {
  const [result] = await db.query(`DELETE FROM tb_educations WHERE education_id = ?`, [education_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getEducationBaseQuery() {
  return `
  SELECT
    education_id,education_name, education_created_at

  FROM tb_educations
  `;
}

// =====================================================================================================================================================

// READ BY NAME
export async function getEducationByName(education_name) {
  const [rows] = await db.query(getEducationBaseQuery() + ` WHERE education_name = ? GROUP BY education_name`, [education_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortEducations({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getEducationBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY education_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY education_id ORDER BY education_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        education_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY education_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["education_name", "education_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "education_name" || field === "education_created_at") {
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
