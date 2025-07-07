import db from "../configs/database.js";

// CREATE
export async function createTrainingType(training_type) {
  const connection = await db.getConnection();
  const { training_type_name } = training_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_training_types (
        training_type_name        
      ) VALUES (?)`;
    const values = [training_type_name];
    const [res] = await connection.query(query, values);
    const training_type_id = res.insertId;
    await connection.commit();
    return { training_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getTrainingTypeAll() {
  const [rows] = await db.query(
    getTrainingTypeBaseQuery() +
      `
GROUP BY training_type_id
ORDER BY training_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getTrainingTypeById(training_type_id) {
  const [rows] = await db.query(getTrainingTypeBaseQuery() + ` WHERE training_type_id = ? GROUP BY training_type_id`, [training_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateTrainingTypeById(training_type_id, training_type) {
  const connection = await db.getConnection();
  const { training_type_name } = training_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_training_types SET
                      training_type_name = ?
                  WHERE training_type_id = ?`;
    const values = [training_type_name, training_type_id];
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
export async function deleteTrainingTypeById(training_type_id) {
  const [result] = await db.query(`DELETE FROM tb_training_types WHERE training_type_id = ?`, [training_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getTrainingTypeBaseQuery() {
  return `
  SELECT
    training_type_id,training_type_name, training_type_updated_at
  FROM tb_training_types
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getTrainingTypeByName(training_type_name) {
  const [rows] = await db.query(getTrainingTypeBaseQuery() + ` WHERE training_type_name = ? GROUP BY training_type_name`, [training_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortTrainingTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getTrainingTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY training_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY training_type_id ORDER BY training_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        training_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY training_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["training_type_name", "training_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "training_type_name" || field === "training_type_created_at") {
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
