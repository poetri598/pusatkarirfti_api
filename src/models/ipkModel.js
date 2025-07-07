import db from "../configs/database.js";

// CREATE
export async function createIpk(ipk) {
  const connection = await db.getConnection();
  const { ipk_no } = ipk;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_ipks (
        ipk_no      
      ) VALUES ( ?)`;
    const values = [ipk_no];
    const [res] = await connection.query(query, values);
    const ipk_id = res.insertId;
    await connection.commit();
    return { ipk_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getIpkAll() {
  const [rows] = await db.query(
    getIpkBaseQuery() +
      `
GROUP BY ipk_id
ORDER BY ipk_id ASC`
  );
  return rows;
}

// READ BY ID
export async function getIpkById(ipk_id) {
  const [rows] = await db.query(getIpkBaseQuery() + ` WHERE ipk_id = ? GROUP BY ipk_id`, [ipk_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateIpkById(ipk_id, ipk) {
  const connection = await db.getConnection();
  const { ipk_no } = ipk;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_ipks SET
                      ipk_no = ?, ipk_created_at = CURRENT_TIMESTAMP()
                  WHERE ipk_id = ?`;
    const values = [ipk_no, ipk_id];
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
export async function deleteIpkById(ipk_id) {
  const [result] = await db.query(`DELETE FROM tb_ipks WHERE ipk_id = ?`, [ipk_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getIpkBaseQuery() {
  return `
  SELECT
    ipk_id,ipk_no,ipk_updated_at

  FROM tb_ipks
  `;
}

// ============================================================================================================================================

// READ BY NO
export async function getIpkByNo(ipk_no) {
  const [rows] = await db.query(getIpkBaseQuery() + ` WHERE ipk_no = ? GROUP BY ipk_no`, [ipk_no]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortIpks({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getIpkBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY ipk_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY ipk_id ORDER BY ipk_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        ipk_no LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY ipk_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["ipk_no", "ipk_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "ipk_no" || field === "ipk_created_at") {
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
