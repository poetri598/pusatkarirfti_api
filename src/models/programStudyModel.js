import db from "../configs/database.js";

// CREATE
export async function createProgramStudy(program_study) {
  const connection = await db.getConnection();
  const { program_study_name } = program_study;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_program_studies (
        program_study_name        
      ) VALUES (?)`;
    const values = [program_study_name];
    const [res] = await connection.query(query, values);
    const program_study_id = res.insertId;
    await connection.commit();
    return { program_study_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getProgramStudyAll() {
  const [rows] = await db.query(
    getProgramStudyBaseQuery() +
      `
GROUP BY program_study_id
ORDER BY program_study_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getProgramStudyById(program_study_id) {
  const [rows] = await db.query(getProgramStudyBaseQuery() + ` WHERE program_study_id = ? GROUP BY program_study_id`, [program_study_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateProgramStudyById(program_study_id, program_study) {
  const connection = await db.getConnection();
  const { program_study_name } = program_study;
  try {
    await connection.beginTransaction();
    const query = `UPDATE tb_program_studies SET
                      program_study_name = ?, program_study_created_at = CURRENT_TIMESTAMP()
                  WHERE program_study_id = ?`;
    const values = [program_study_name, program_study_id];
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
export async function deleteProgramStudyById(program_study_id) {
  const [result] = await db.query(`DELETE FROM tb_program_studies WHERE program_study_id = ?`, [program_study_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getProgramStudyBaseQuery() {
  return `
  SELECT
    program_study_id,program_study_name, program_study_created_at

  FROM tb_program_studies
  `;
}

//==============================================================================================================================================================

// READ BY NAME
export async function getProgramStudyByName(program_study_name) {
  const [rows] = await db.query(getProgramStudyBaseQuery() + ` WHERE program_study_name = ? GROUP BY program_study_name`, [program_study_name]);
  return rows[0];
}

// SEARCH FILTER SORT
export async function searchFilterSortProgramStudies({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getProgramStudyBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY program_study_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY program_study_id ORDER BY program_study_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        program_study_name LIKE ?)`);
    values.push(...Array(1).fill(keyword));
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY program_study_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["program_study_name", "program_study_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "program_study_name" || field === "program_study_created_at") {
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
