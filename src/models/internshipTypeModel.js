import db from "../configs/database.js";

// CREATE
export async function createInternshipType(internship_type) {
  const connection = await db.getConnection();
  const { internship_type_name } = internship_type;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_internship_types (
        internship_type_name        
      ) VALUES (?)`;
    const values = [internship_type_name];
    const [res] = await connection.query(query, values);
    const internship_type_id = res.insertId;
    await connection.commit();
    return { internship_type_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getInternshipTypeAll() {
  const [rows] = await db.query(
    getInternshipTypeBaseQuery() +
      `
GROUP BY internship_type_id
ORDER BY internship_type_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getInternshipTypeById(internship_type_id) {
  const [rows] = await db.query(getInternshipTypeBaseQuery() + ` WHERE internship_type_id = ? GROUP BY internship_type_id`, [internship_type_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateInternshipTypeById(internship_type_id, internship_type) {
  const connection = await db.getConnection();
  const { internship_type_name } = internship_type;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_internship_types SET
                      internship_type_name = ?, internship_type_created_at = CURRENT_TIMESTAMP()
                  WHERE internship_type_id = ?`;
    const values = [internship_type_name, internship_type_id];
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
export async function deleteInternshipTypeById(internship_type_id) {
  const [result] = await db.query(`DELETE FROM tb_internship_types WHERE internship_type_id = ?`, [internship_type_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getInternshipTypeBaseQuery() {
  return `
  SELECT
    internship_type_id,internship_type_name, internship_type_created_at

  FROM tb_internship_types
  `;
}

// ==========================================================================================================================================

// READ BY NAME
export async function getInternshipTypeByName(internship_type_name) {
  const [rows] = await db.query(getInternshipTypeBaseQuery() + ` WHERE internship_type_name = ? GROUP BY internship_type_name`, [internship_type_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortInternshipTypes({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getInternshipTypeBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY internship_type_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY internship_type_id ORDER BY internship_type_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        internship_type_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY internship_type_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["internship_type_name", "internship_type_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "internship_type_name" || field === "internship_type_created_at") {
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
