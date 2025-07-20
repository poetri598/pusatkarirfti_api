import db from "../configs/database.js";

// CREATE
export async function createNews(news) {
  const connection = await db.getConnection();
  const { news_img, news_name, news_slug, news_desc, news_tags = "", news_type_id, user_id, status_id } = news;
  try {
    await connection.beginTransaction();
    const query = `
                  INSERT INTO tb_news (
                                        news_img, 
                                        news_name, 
                                        news_slug, 
                                        news_desc,
                                        news_tags, 
                                        news_type_id, 
                                        user_id,
                                        status_id
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [news_img, news_name, news_slug, news_desc, news_tags, news_type_id, user_id, status_id];
    const [res] = await connection.query(query, values);
    await connection.commit();
    return { news_id: res.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getNewsAll() {
  const [rows] = await db.query(getNewsBaseQuery() + ` WHERE status.status_id = 1 AND news_type.news_type_id <> 2 GROUP BY news.news_id ORDER BY news.news_created_at DESC`);
  return rows;
}

// READ BY ID
export async function getNewsById(news_id) {
  const [rows] = await db.query(getNewsBaseQuery() + ` WHERE news.news_id = ? GROUP BY news.news_id`, [news_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateNewsById(news_id, news) {
  const connection = await db.getConnection();
  const { news_img, news_name, news_slug, news_desc, news_tags = "", news_type_id, user_id, status_id } = news;
  try {
    await connection.beginTransaction();
    const query = `
                    UPDATE tb_news SET
                                        news_img = ?,
                                        news_name = ?, 
                                        news_slug = ?,  
                                        news_desc = ?, 
                                        news_tags = ?, 
                                        news_created_at = CURRENT_TIMESTAMP(),
                                        news_type_id = ?, 
                                        user_id = ?, 
                                        status_id = ?
                      WHERE news_id = ?`;
    const values = [news_img, news_name, news_slug, news_desc, news_tags, news_type_id, user_id, status_id, news_id];
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
export async function deleteNewsById(news_id) {
  const [result] = await db.query(`DELETE FROM tb_news WHERE news_id = ?`, [news_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getNewsBaseQuery() {
  return `
  SELECT
    news.news_id,
    news.news_img,
    news.news_name,
    news.news_slug,
    news.news_desc,
    news.news_tags,
    news.news_views,
    news.news_created_at,
    news.user_id,
    user.user_img,
    user.user_fullname,
    user.role_id,
    role.role_name,
    news.status_id,
    status.status_name,
    news.news_type_id,
    news_type.news_type_name

  FROM tb_news news

  #SINGLE
  LEFT JOIN tb_statuses status ON news.status_id = status.status_id
  LEFT JOIN tb_users user ON news.user_id = user.user_id
  LEFT JOIN tb_roles role ON user.role_id = role.role_id
  LEFT JOIN tb_news_types news_type ON news.news_type_id = news_type.news_type_id
  `;
}

//==============================================================================================================================================================

// READ BY SLUG
export async function getNewsBySlug(news_slug) {
  const [rows] = await db.query(getNewsBaseQuery() + ` WHERE news.news_slug = ? GROUP BY news.news_id`, [news_slug]);
  return rows[0];
}

// READ THREE LATEST
export async function getThreeLatestNews() {
  const [rows] = await db.query(getNewsBaseQuery() + ` WHERE status.status_id = 1 GROUP BY news.news_id ORDER BY news.news_created_at DESC LIMIT 3`);
  return rows;
}

// READ ALL– EXCEPT SLUG
export async function getNewsAllExceptSlug(news_slug) {
  const [rows] = await db.query(
    getNewsBaseQuery() +
      ` WHERE status.status_id = 1
        AND news.news_slug <> ?
        AND news_type.news_type_id <> 2
      GROUP BY news.news_id
      ORDER BY RAND()
      LIMIT 3
`,
    [news_slug]
  );
  return rows;
}

// READ ONE MOST POPULAR
export async function getOneMostPopularNews() {
  const [rows] = await db.query(
    getNewsBaseQuery() +
      `
      WHERE  status.status_id = 1
      GROUP  BY news.news_id
      ORDER  BY news.news_views DESC
      LIMIT  1`
  );
  return rows[0];
}

// UPDATE VIEW
export async function incrementViewBySlug(news_slug) {
  await db.query(`UPDATE tb_news SET news_views = news_views + 1 WHERE news_slug = ?`, [news_slug]);
  const [rows] = await db.query(`SELECT news_views FROM tb_news WHERE news_slug = ?`, [news_slug]);
  return rows[0];
}

// READ ALL BY TYPE NAME KEGIATAN PUSAT KARIR FTI
export async function getNewsAllByTypeNameKegiatanPusatKarirFTI() {
  const [rows] = await db.query(
    getNewsBaseQuery() +
      ` WHERE status.status_id = 1
        AND news_type.news_type_name = 'Kegiatan Pusat Karir FTI'
        GROUP BY news.news_id
        ORDER BY news.news_created_at DESC`
  );
  return rows;
}

// READ ALL BY TYPE NAME KEGIATAN PUSAT KARIR FTI EXCEPT SLUG
export async function getNewsAllByTypeNameKegiatanPusatKarirFTIExceptSlug(news_slug) {
  const [rows] = await db.query(
    getNewsBaseQuery() +
      ` WHERE status.status_id = 1
        AND news_type.news_type_id <> 1
        AND news.news_slug <> ?
        GROUP BY news.news_id
        ORDER BY RAND()
        LIMIT 3
`,
    [news_slug]
  );
  return rows;
}

// SEARCH FILTER SORT
export async function searchFilterSortNews({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getNewsBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY news.news_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY news.news_id ORDER BY news.news_created_at DESC`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        news.news_name LIKE ? OR 
                        news.news_desc LIKE ? OR 
                        news.news_tags LIKE ? OR 
                        user.user_fullname LIKE ? OR 
                        news_type.news_type_name LIKE ?)`);
    values.push(...Array(5).fill(keyword));
  }

  // Direct filters
  const directFilters = ["news_type_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`news.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY news.news_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...directFilters, "news_views", "news_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "news_views" || field === "news_created_at") {
        orderBy = `ORDER BY news.${field} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY news.total_relations ASC, news.${field} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}

// SEARCH FILTER SORT ACTIVE
export async function searchFilterSortNewsActive({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getNewsBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort;

  let orderBy = `ORDER BY news.news_created_at DESC`;

  // Default
  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} WHERE news.status_id = 1 GROUP BY news.news_id ORDER BY news.news_created_at DESC`);
    return rows;
  }

  const conditions = ["news.status_id = 1"];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
                        news.news_name LIKE ? OR 
                        news.news_desc LIKE ? OR 
                        news.news_tags LIKE ? OR 
                        user.user_fullname LIKE ? OR 
                        news_type.news_type_name LIKE ?)`);
    values.push(...Array(5).fill(keyword));
  }

  // Direct filters
  const directFilters = ["news_type_id", "user_id", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`news.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `${baseQuery} ${baseWhere} GROUP BY news.news_id`;

  // Sorting
  if (!isSortEmpty && typeof sort === "string") {
    const [field, dir] = sort.split(":");
    const validSorts = [...directFilters, "news_views", "news_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      if (field === "news_views" || field === "news_created_at") {
        orderBy = `ORDER BY news.${field} ${dir.toUpperCase()}`;
      } else {
        orderBy = `ORDER BY news.total_relations ASC, news.${field} ${dir.toUpperCase()}`;
      }
    }
  }

  const finalQuery = `${query} ${orderBy}`;
  const [rows] = await db.query(finalQuery, values);
  return rows;
}

// GET SUMMARY
export async function getSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total_all,
      COUNT(CASE WHEN status_id = 1 THEN 1 END) AS total_status_1,
      COUNT(CASE WHEN status_id = 2 THEN 1 END) AS total_status_2
    FROM tb_news
  `);
  return rows[0];
}
