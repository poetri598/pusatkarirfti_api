import db from "../configs/database.js";

// CREATE
export async function createActivity(activity) {
  const connection = await db.getConnection();
  const { activity_name } = activity;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_activities (
                                  activity_name        
                                ) 
      VALUES (?)`;
    const values = [activity_name];
    const [res] = await connection.query(query, values);
    const activity_id = res.insertId;
    await connection.commit();
    return { activity_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getActivityAll() {
  const [rows] = await db.query(getActivityBaseQuery() + ` GROUP BY activity_id ORDER BY activity_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getActivityById(activity_id) {
  const [rows] = await db.query(getActivityBaseQuery() + ` WHERE activity_id = ? GROUP BY activity_id`, [activity_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateActivityById(activity_id, activity) {
  const connection = await db.getConnection();
  const { activity_name } = activity;
  try {
    await connection.beginTransaction();
    const query = `
                  UPDATE tb_activities SET
                                            activity_name = ?, 
                                            activity_created_at = CURRENT_TIMESTAMP()
                  WHERE activity_id = ?`;
    const values = [activity_name, activity_id];
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
export async function deleteActivityById(activity_id) {
  const [result] = await db.query(`DELETE FROM tb_activities WHERE activity_id = ?`, [activity_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getActivityBaseQuery() {
  return `
          SELECT
                activity_id,
                activity_name, 
                activity_created_at
          FROM tb_activities
  `;
}

// ========================================================================================================================================================

// READ BY NAME
export async function getActivityByName(activity_name) {
  const [rows] = await db.query(getActivityBaseQuery() + ` WHERE activity_name = ? GROUP BY activity_name`, [activity_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortActivities({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getActivityBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY activity_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY activity_id ORDER BY activity_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        activity_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY activity_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["activity_name", "activity_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "activity_name" || field === "activity_created_at") {
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
