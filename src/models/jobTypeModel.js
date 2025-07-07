import db from "../configs/database.js";

// CREATE
export async function createJobType(job_type) {
  const connection = await db.getConnection();
  const { job_type_name } = job_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_job_types (
        job_type_name        
      ) VALUES (?)`;
    const values = [job_type_name];
    const [res] = await connection.query(query, values);
    const job_type_id = res.insertId;
    await connection.commit();
    return { job_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getJobTypeAll() {
  const [rows] = await db.query(
    getJobTypeBaseQuery() +
      `
GROUP BY job_type_id
ORDER BY job_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getJobTypeById(job_type_id) {
  const [rows] = await db.query(getJobTypeBaseQuery() + ` WHERE job_type_id = ? GROUP BY job_type_id`, [job_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateJobTypeById(job_type_id, job_type) {
  const connection = await db.getConnection();
  const { job_type_name } = job_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_job_types SET
                      job_type_name = ?, job_type_created_at = CURRENT_TIMESTAMP()
                  WHERE job_type_id = ?`;
    const values = [job_type_name, job_type_id];
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
export async function deleteJobTypeById(job_type_id) {
  const [result] = await db.query(`DELETE FROM tb_job_types WHERE job_type_id = ?`, [job_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getJobTypeBaseQuery() {
  return `
  SELECT
    job_type_id,job_type_name, job_type_created_at

  FROM tb_job_types
  `;
}

// =======================================================================================================================================================

// READ BY NAME
export async function getJobTypeByName(job_type_name) {
  const [rows] = await db.query(getJobTypeBaseQuery() + ` WHERE job_type_name = ? GROUP BY job_type_name`, [job_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortJobTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getJobTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY job_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY job_type_id ORDER BY job_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        job_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY job_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["job_type_name", "job_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "job_type_name" || field === "job_type_created_at") {
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
