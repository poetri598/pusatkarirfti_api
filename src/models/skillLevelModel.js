import db from "../configs/database.js";

// CREATE
export async function createSkillLevel(skillLevel) {
  const connection = await db.getConnection();
  const { skill_level_name } = skillLevel;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_skill_levels (
        skill_level_name
      ) VALUES (?)`;
    const values = [skill_level_name];
    const [res] = await connection.query(query, values);
    await connection.commit();
    return { skill_level_id: res.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getSkillLevelAll() {
  const [rows] = await db.query(getSkillLevelBaseQuery() + ` ORDER BY skill_level_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getSkillLevelById(skill_level_id) {
  const [rows] = await db.query(getSkillLevelBaseQuery() + ` WHERE skill_level_id = ?`, [skill_level_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateSkillLevelById(skill_level_id, skillLevel) {
  const connection = await db.getConnection();
  const { skill_level_name } = skillLevel;
  try {
    await connection.beginTransaction();
    const query = `
      UPDATE tb_skill_levels SET
        skill_level_name = ?,
        skill_level_updated_at = CURRENT_TIMESTAMP()
      WHERE skill_level_id = ?`;
    const values = [skill_level_name, skill_level_id];
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
export async function deleteSkillLevelById(skill_level_id) {
  const [result] = await db.query(`DELETE FROM tb_skill_levels WHERE skill_level_id = ?`, [skill_level_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getSkillLevelBaseQuery() {
  return `
    SELECT
      skill_level_id,
      skill_level_name,
      skill_level_created_at,
      skill_level_updated_at
    FROM tb_skill_levels`;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getSkillLevelByName(skill_level_name) {
  const [rows] = await db.query(getSkillLevelBaseQuery() + ` WHERE skill_level_name = ?`, [skill_level_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortSkillLevels({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getSkillLevelBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY skill_level_created_at DESC`;

  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY skill_level_id ORDER BY skill_level_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(skill_level_name LIKE ?)`);
    values.push(keyword);
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY skill_level_id`;

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["skill_level_name", "skill_level_created_at", "skill_level_updated_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      orderBy = `ORDER BY ${field} ${dir.toUpperCase()}`;
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}
