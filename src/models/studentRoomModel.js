import db from "../configs/database.js";

// CREATE
export async function createStudentRoom(StudentRoom) {
  const connection = await db.getConnection();
  const { student_room_img, student_room_name, student_room_desc, user_id, status_id } = StudentRoom;
  try {
    await connection.beginTransaction();
    const query = `
      INSERT INTO tb_student_rooms (
                                    student_room_img, 
                                    student_room_name, 
                                    student_room_desc,
                                    user_id,
                                    status_id
                                  ) 
      VALUES (?, ?, ?, ?, ?)`;
    const values = [student_room_img, student_room_name, student_room_desc, user_id, status_id];
    const [res] = await connection.query(query, values);
    const student_room_id = res.insertId;
    await connection.commit();
    return { student_room_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getStudentRoomAll() {
  const [rows] = await db.query(
    getStudentRoomBaseQuery() +
      ` WHERE status.status_id = 1
        GROUP BY student_room.student_room_id
        ORDER BY student_room.student_room_created_at DESC`
  );
  return rows;
}

// READ BY ID
export async function getStudentRoomById(student_room_id) {
  const [rows] = await db.query(getStudentRoomBaseQuery() + ` WHERE student_room.student_room_id = ? ORDER BY student_room.student_room_updated_at DESC`, [student_room_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateStudentRoomById(student_room_id, StudentRoom) {
  const connection = await db.getConnection();
  const { student_room_img, student_room_name, student_room_desc, user_id, status_id } = StudentRoom;
  try {
    await connection.beginTransaction();
    const query = `
                  UPDATE tb_student_rooms SET
                                              student_room_img = ?,
                                              student_room_name = ?,   
                                              student_room_desc = ?, 
                                              user_id = ?, 
                                              status_id = ?
                  WHERE student_room_id = ?`;
    const values = [student_room_img, student_room_name, student_room_desc, user_id, status_id, student_room_id];
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
export async function deleteStudentRoomById(student_room_id) {
  const [result] = await db.query(`DELETE FROM tb_student_rooms WHERE student_room_id = ?`, [student_room_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getStudentRoomBaseQuery() {
  return `
  SELECT
    student_room.student_room_id,
    student_room.student_room_name,
    student_room.student_room_img,
    student_room.student_room_desc,
    student_room.student_room_created_at,
    student_room.user_id,
    user.user_img,
    user.user_fullname,
    user.user_is_employed,
    user.program_study_id,
    program_study.program_study_name,
    user.current_position_id,
    position.position_name AS current_position_name,
    user.current_company_id,
    company.company_name AS current_company_name,
    company.company_img,
    user.role_id,
    role.role_name,
    student_room.status_id,
    status.status_name

FROM tb_student_rooms student_room
LEFT JOIN tb_statuses status ON student_room.status_id = status.status_id
LEFT JOIN tb_users user ON student_room.user_id = user.user_id
LEFT JOIN tb_roles role ON user.role_id = role.role_id
LEFT JOIN tb_positions position ON user.current_position_id = position.position_id
LEFT JOIN tb_companies company ON user.current_company_id = company.company_id
LEFT JOIN tb_program_studies program_study ON user.program_study_id = program_study.program_study_id
  `;
}

//==============================================================================================================================================================

// READ FOUR LATEST
export async function getFourLatestStudentRoom() {
  const [rows] = await db.query(
    getStudentRoomBaseQuery() +
      ` WHERE status.status_id = 1 
        AND user.user_is_employed = 1
        GROUP BY student_room.student_room_id
        ORDER BY student_room.student_room_created_at DESC
        LIMIT 4
      `
  );
  return rows;
}

// SEARCH FILTER SORT
export async function searchFilterSortStudentRooms({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getStudentRoomBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY student_room.student_room_updated_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY student_room.student_room_id ORDER BY student_room.student_room_updated_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        student_room.student_room_name LIKE ? OR 
                        student_room.student_room_desc LIKE ? OR 
                        user.user_fullname LIKE ? 
                      )`);
    values.push(...Array(3).fill(keyword));
  }

  // Direct filters
  const directFilters = ["user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`student_room.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY student_room.student_room_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...directFilters, "student_room_updated_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "student_room_created_at") {
        orderBy = `ORDER BY student_room.${field} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY student_room.${field} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}
