import db from "../configs/database.js";

// CREATE
export async function createSkill(skill) {
  const connection = await db.getConnection();
  const { skill_name, skill_desc } = skill;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_skills (
        skill_name, skill_desc       
      ) VALUES (?, ?)`;
    const values = [skill_name, skill_desc];
    const [res] = await connection.query(query, values);
    const skill_id = res.insertId;
    await connection.commit();
    return { skill_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getSkillAll() {
  const [rows] = await db.query(
    getSkillBaseQuery() +
      `
GROUP BY skill_id
ORDER BY skill_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getSkillById(skill_id) {
  const [rows] = await db.query(getSkillBaseQuery() + ` WHERE skill_id = ? GROUP BY skill_id`, [skill_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateSkillById(skill_id, skill) {
  const connection = await db.getConnection();
  const { skill_name, skill_desc } = skill;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_skills SET
                      skill_name = ?, skill_desc = ?, skill_created_at = CURRENT_TIMESTAMP()
                  WHERE skill_id = ?`;
    const values = [skill_name, skill_desc, skill_id];
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
export async function deleteSkillById(skill_id) {
  const [result] = await db.query(`DELETE FROM tb_skills WHERE skill_id = ?`, [skill_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getSkillBaseQuery() {
  return `
  SELECT
    skill_id, skill_name, skill_desc, skill_created_at

  FROM tb_skills
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getSkillByName(skill_name) {
  const [rows] = await db.query(getSkillBaseQuery() + ` WHERE skill_name = ? GROUP BY skill_name`, [skill_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortSkills({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getSkillBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY skill_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY skill_id ORDER BY skill_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        skill_name LIKE ? OR skill_desc LIKE ?)`);
    values.push(...Array(2).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY skill_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["skill_name", "skill_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "skill_name" || field === "skill_created_at") {
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
