import db from "../configs/database.js";

// CREATE
export async function createProfilCdcFti(data) {
  const connection = await db.getConnection();
  const {
    profil_cdc_fti_firstname,
    profil_cdc_fti_img,
    profil_cdc_fti_lastname,
    profil_cdc_fti_vision_name,
    profil_cdc_fti_vision_img,
    profil_cdc_fti_mission_name,
    profil_cdc_fti_mission_img,
    profil_cdc_fti_goal_name,
    profil_cdc_fti_goal_img,
    profil_cdc_fti_benefit_name,
    profil_cdc_fti_benefit_img,
    profil_cdc_fti_email,
    profil_cdc_fti_instagram,
    profil_cdc_fti_facebook,
    profil_cdc_fti_youtube,
    profil_cdc_fti_whatsapp,
  } = data;

  try {
    await connection.beginTransaction();

    const query = `
      INSERT INTO tb_profil_cdc_fti (
        profil_cdc_fti_firstname,
        profil_cdc_fti_img,
        profil_cdc_fti_lastname,
        profil_cdc_fti_vision_name,
        profil_cdc_fti_vision_img,
        profil_cdc_fti_mission_name,
        profil_cdc_fti_mission_img,
        profil_cdc_fti_goal_name,
        profil_cdc_fti_goal_img,
        profil_cdc_fti_benefit_name,
        profil_cdc_fti_benefit_img,
        profil_cdc_fti_email,
        profil_cdc_fti_instagram,
        profil_cdc_fti_facebook,
        profil_cdc_fti_youtube,
        profil_cdc_fti_whatsapp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      profil_cdc_fti_firstname,
      profil_cdc_fti_img,
      profil_cdc_fti_lastname,
      profil_cdc_fti_vision_name,
      profil_cdc_fti_vision_img,
      profil_cdc_fti_mission_name,
      profil_cdc_fti_mission_img,
      profil_cdc_fti_goal_name,
      profil_cdc_fti_goal_img,
      profil_cdc_fti_benefit_name,
      profil_cdc_fti_benefit_img,
      profil_cdc_fti_email,
      profil_cdc_fti_instagram,
      profil_cdc_fti_facebook,
      profil_cdc_fti_youtube,
      profil_cdc_fti_whatsapp,
    ];

    const [res] = await connection.query(query, values);
    await connection.commit();

    return { profil_cdc_fti_id: res.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getProfilCdcFtiAll() {
  const [rows] = await db.query(getProfilCdcFtiBaseQuery() + ` ORDER BY profil_cdc_fti_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getProfilCdcFtiById(profil_cdc_fti_id) {
  const [rows] = await db.query(getProfilCdcFtiBaseQuery() + ` WHERE profil_cdc_fti_id = ?`, [profil_cdc_fti_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateProfilCdcFtiById(profil_cdc_fti_id, data) {
  const connection = await db.getConnection();
  const {
    profil_cdc_fti_firstname,
    profil_cdc_fti_img,
    profil_cdc_fti_lastname,
    profil_cdc_fti_vision_name,
    profil_cdc_fti_vision_img,
    profil_cdc_fti_mission_name,
    profil_cdc_fti_mission_img,
    profil_cdc_fti_goal_name,
    profil_cdc_fti_goal_img,
    profil_cdc_fti_benefit_name,
    profil_cdc_fti_benefit_img,
    profil_cdc_fti_email,
    profil_cdc_fti_instagram,
    profil_cdc_fti_facebook,
    profil_cdc_fti_youtube,
    profil_cdc_fti_whatsapp,
  } = data;

  try {
    await connection.beginTransaction();

    const query = `
      UPDATE tb_profil_cdc_fti SET
        profil_cdc_fti_firstname = ?,
        profil_cdc_fti_img = ?,
        profil_cdc_fti_lastname = ?,
        profil_cdc_fti_vision_name = ?,
        profil_cdc_fti_vision_img = ?,
        profil_cdc_fti_mission_name = ?,
        profil_cdc_fti_mission_img = ?,
        profil_cdc_fti_goal_name = ?,
        profil_cdc_fti_goal_img = ?,
        profil_cdc_fti_benefit_name = ?,
        profil_cdc_fti_benefit_img = ?,
        profil_cdc_fti_email = ?,
        profil_cdc_fti_instagram = ?,
        profil_cdc_fti_facebook = ?,
        profil_cdc_fti_youtube = ?,
        profil_cdc_fti_whatsapp = ?,
        profil_cdc_fti_updated_at = CURRENT_TIMESTAMP()
      WHERE profil_cdc_fti_id = ?
    `;

    const values = [
      profil_cdc_fti_firstname,
      profil_cdc_fti_img,
      profil_cdc_fti_lastname,
      profil_cdc_fti_vision_name,
      profil_cdc_fti_vision_img,
      profil_cdc_fti_mission_name,
      profil_cdc_fti_mission_img,
      profil_cdc_fti_goal_name,
      profil_cdc_fti_goal_img,
      profil_cdc_fti_benefit_name,
      profil_cdc_fti_benefit_img,
      profil_cdc_fti_email,
      profil_cdc_fti_instagram,
      profil_cdc_fti_facebook,
      profil_cdc_fti_youtube,
      profil_cdc_fti_whatsapp,
      profil_cdc_fti_id,
    ];

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
export async function deleteProfilCdcFtiById(profil_cdc_fti_id) {
  const [result] = await db.query(`DELETE FROM tb_profil_cdc_fti WHERE profil_cdc_fti_id = ?`, [profil_cdc_fti_id]);
  return result;
}

// BASE QUERY
function getProfilCdcFtiBaseQuery() {
  return `
    SELECT 
      profil_cdc_fti_id,
      profil_cdc_fti_firstname,
      profil_cdc_fti_img,
      profil_cdc_fti_lastname,
      profil_cdc_fti_vision_name,
      profil_cdc_fti_vision_img,
      profil_cdc_fti_mission_name,
      profil_cdc_fti_mission_img,
      profil_cdc_fti_goal_name,
      profil_cdc_fti_goal_img,
      profil_cdc_fti_benefit_name,
      profil_cdc_fti_benefit_img,
      profil_cdc_fti_email,
      profil_cdc_fti_instagram,
      profil_cdc_fti_facebook,
      profil_cdc_fti_youtube,
      profil_cdc_fti_whatsapp,
      profil_cdc_fti_created_at,
      profil_cdc_fti_updated_at
    FROM tb_profil_cdc_fti
  `;
}

// SEARCH FILTER SORT
export async function searchFilterSortProfilCdcFti({ search = "", sort = "" }) {
  const baseQuery = getProfilCdcFtiBaseQuery();

  const isSearchEmpty = !search;
  const isSortEmpty = !sort;
  let orderBy = `ORDER BY profil_cdc_fti_created_at DESC`;

  if (isSearchEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} ${orderBy}`);
    return rows;
  }

  const conditions = [];
  const values = [];

  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      profil_cdc_fti_firstname LIKE ? OR
      profil_cdc_fti_lastname LIKE ? OR
      profil_cdc_fti_email LIKE ? OR
      profil_cdc_fti_instagram LIKE ? OR
      profil_cdc_fti_facebook LIKE ? OR
      profil_cdc_fti_youtube LIKE ? OR
      profil_cdc_fti_whatsapp LIKE ?
    )`);
    values.push(...Array(7).fill(keyword));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = ["profil_cdc_fti_firstname", "profil_cdc_fti_lastname", "profil_cdc_fti_email", "profil_cdc_fti_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir.toLowerCase())) {
      orderBy = `ORDER BY ${field} ${dir.toUpperCase()}`;
    }
  }

  const finalQuery = `${baseQuery} ${whereClause} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}
