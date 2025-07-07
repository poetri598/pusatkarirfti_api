import db from "../configs/database.js";

// CREATE
export async function createExperience(experience) {
  const connection = await db.getConnection();
  const { experience_name, experience_desc } = experience;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_experiences (
        experience_name, experience_desc       
      ) VALUES (?, ?)`;
    const values = [experience_name, experience_desc];
    const [res] = await connection.query(query, values);
    const experience_id = res.insertId;
    await connection.commit();
    return { experience_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getExperienceAll() {
  const [rows] = await db.query(
    getExperienceBaseQuery() +
      `
GROUP BY experience_id
ORDER BY experience_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getExperienceById(experience_id) {
  const [rows] = await db.query(getExperienceBaseQuery() + ` WHERE experience_id = ? GROUP BY experience_id`, [experience_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateExperienceById(experience_id, experience) {
  const connection = await db.getConnection();
  const { experience_name, experience_desc } = experience;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_experiences SET
                      experience_name = ?, experience_desc = ?, experience_created_at = CURRENT_TIMESTAMP()
                  WHERE experience_id = ?`;
    const values = [experience_name, experience_desc, experience_id];
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
export async function deleteExperienceById(experience_id) {
  const [result] = await db.query(`DELETE FROM tb_experiences WHERE experience_id = ?`, [experience_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getExperienceBaseQuery() {
  return `
  SELECT
    experience_id,experience_name, experience_desc, experience_created_at

  FROM tb_experiences
  `;
}

// ===================================================================================================================================================

// READ BY NAME
export async function getExperienceByName(experience_name) {
  const [rows] = await db.query(getExperienceBaseQuery() + ` WHERE experience_name = ? GROUP BY experience_name`, [experience_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortExperiences({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getExperienceBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY experience_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY experience_id ORDER BY experience_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        experience_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY experience_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["experience_name", "experience_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "experience_name" || field === "experience_created_at") {
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
