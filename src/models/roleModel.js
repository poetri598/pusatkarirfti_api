import db from "../configs/database.js";

// CREATE
export async function createRole(role) {
  const connection = await db.getConnection();
  const { role_name } = role;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_roles (
        role_name     
      ) VALUES (?)`;
    const values = [role_name];
    const [res] = await connection.query(query, values);
    const role_id = res.insertId;
    await connection.commit();
    return { role_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getRoleAll() {
  const [rows] = await db.query(
    getRoleBaseQuery() +
      `
GROUP BY role_id
ORDER BY role_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getRoleById(role_id) {
  const [rows] = await db.query(getRoleBaseQuery() + ` WHERE role_id = ? GROUP BY role_id`, [role_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateRoleById(role_id, role) {
  const connection = await db.getConnection();
  const { role_name } = role;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_roles SET
                      role_name = ?, role_created_at = CURRENT_TIMESTAMP()
                  WHERE role_id = ?`;
    const values = [role_name, role_id];
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
export async function deleteRoleById(role_id) {
  const [result] = await db.query(`DELETE FROM tb_roles WHERE role_id = ?`, [role_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getRoleBaseQuery() {
  return `
  SELECT
    role_id, role_name, role_created_at

  FROM tb_roles
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getRoleByName(role_name) {
  const [rows] = await db.query(getRoleBaseQuery() + ` WHERE role_name = ? GROUP BY role_name`, [role_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortRoles({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getRoleBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY role_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY role_id ORDER BY role_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        role_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY role_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["role_name", "role_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "role_name" || field === "role_created_at") {
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
