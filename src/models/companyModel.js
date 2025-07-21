import db from "../configs/database.js";
import { allowedPivotTables } from "../utils/pivotTables.js";

// Refresh pivot tables
async function refreshPivot(conn, table, column, company_id, ids = [], entity = "companies") {
  const allowedTablesForEntity = allowedPivotTables[entity] || [];
  if (!allowedTablesForEntity.includes(table)) {
    throw new Error(`"${table}" pada "${entity}" tidak ditemukan`);
  }
  if (!Array.isArray(ids)) {
    ids = typeof ids === "string" ? ids.split(",").map((v) => Number(v.trim())) : [];
  }
  await conn.query(`DELETE FROM ?? WHERE company_id = ?`, [table, company_id]);
  if (ids.length) {
    const rows = ids.map((v) => [company_id, v]);
    await conn.query(`INSERT INTO ?? (company_id, ??) VALUES ?`, [table, column, rows]);
  }
}

// CREATE
export async function createCompany(company) {
  const connection = await db.getConnection();
  const { company_name, company_img, company_link, company_desc, company_is_partner, industry_ids = [] } = company;
  try {
    await connection.beginTransaction();
    const query = `
                  INSERT INTO tb_companies (
                                              company_name, 
                                              company_img, 
                                              company_link, 
                                              company_desc, 
                                              company_is_partner
                                            ) 
                  VALUES (?, ?, ?, ?, ?)`;
    const values = [company_name, company_img, company_link, company_desc, company_is_partner];
    const [res] = await connection.query(query, values);
    const company_id = res.insertId;
    await Promise.all([refreshPivot(connection, "tb_companies_industries", "industry_id", company_id, industry_ids, "companies")]);
    await connection.commit();
    return { company_id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// READ ALL
export async function getCompanyAll() {
  const [rows] = await db.query(getCompanyBaseQuery() + ` WHERE status.status_id = 1 GROUP BY company.company_id ORDER BY company.company_name ASC`);
  return rows;
}

// READ BY ID
export async function getCompanyById(company_id) {
  const [rows] = await db.query(getCompanyBaseQuery() + ` WHERE company.company_id = ? GROUP BY company.company_id`, [company_id]);
  return rows[0];
}

// UPDATE BY ID
export async function updateCompanyById(company_id, company) {
  const connection = await db.getConnection();
  const { company_name, company_img, company_link, company_desc, company_is_partner, status_id, industry_ids = [] } = company;
  try {
    await connection.beginTransaction();
    const query = `
                    UPDATE tb_companies SET
                                            company_name = ?, 
                                            company_img = ?, 
                                            company_link = ?,
                                            company_desc = ?, 
                                            company_created_at = CURRENT_TIMESTAMP(),
                                            company_is_partner = ?, 
                                            status_id = ?
                    WHERE company_id = ?`;
    const values = [company_name, company_img, company_link, company_desc, company_is_partner, status_id, company_id];
    await connection.query(query, values);
    await Promise.all([refreshPivot(connection, "tb_companies_industries", "industry_id", company_id, industry_ids, "companies")]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// DELETE BY ID
export async function deleteCompanyById(company_id) {
  const [result] = await db.query(`DELETE FROM tb_companies WHERE company_id = ?`, [company_id]);
  return result;
}

// COMMON SELECT FUNCTION
function getCompanyBaseQuery() {
  return `
          SELECT
            company.company_id,
            company.company_img,
            company.company_name,
            company.company_desc,
            company.company_link,
            company.company_is_partner,
            company.status_id,
            status.status_name,
            company.company_created_at,
            company.company_updated_at,

          
            GROUP_CONCAT(DISTINCT industry.industry_id)              AS industry_ids,
            GROUP_CONCAT(DISTINCT industry.industry_name)              AS industry_names


            FROM tb_companies company

            #SINGLE 
            LEFT JOIN tb_statuses status ON company.status_id = status.status_id

            #MULTIPLE
            LEFT JOIN tb_companies_industries company_industry ON company.company_id = company_industry.company_id
            LEFT JOIN tb_industries industry ON company_industry.industry_id = industry.industry_id
          `;
}

// =====================================================================================================================================================

// READ BY NAME
export async function getCompanyByName(company_name) {
  const [rows] = await db.query(getCompanyBaseQuery() + ` WHERE company.company_name = ?`, [company_name]);
  return rows[0];
}

// READ ALL PARTNER
export async function getCompanyAllIsPartner() {
  const [rows] = await db.query(
    getCompanyBaseQuery() +
      ` WHERE status.status_id = 1 
        AND company.company_is_partner = 1 
        GROUP BY company.company_id 
        ORDER BY company.company_name ASC`
  );
  return rows;
}

// SEARCH FILTER SORT
export async function searchFilterSortCompanies({ search = "", filters = {}, sort = "" }) {
  const baseQuery = getCompanyBaseQuery();

  const isSearchEmpty = !search;
  const isFiltersEmpty = !Object.values(filters).some((v) => v !== undefined && v !== "");
  const isSortEmpty = !sort || !sort.includes(":");

  let orderBy = `ORDER BY company.company_updated_at DESC`;

  if (isSearchEmpty && isFiltersEmpty && isSortEmpty) {
    const [rows] = await db.query(`${baseQuery} GROUP BY company.company_id ${orderBy}`);
    return rows;
  }

  const conditions = [];
  const values = [];

  // Keyword search
  if (!isSearchEmpty) {
    const keyword = `%${search}%`;
    conditions.push(`(
      company.company_name LIKE ? OR 
      company.company_desc LIKE ? OR 
      industry.industry_name LIKE ?
    )`);
    values.push(...Array(3).fill(keyword));
  }

  // Filters
  const directFilters = ["company_is_partner", "status_id"];
  for (const field of directFilters) {
    if (filters[field] !== undefined && filters[field] !== "") {
      conditions.push(`company.${field} = ?`);
      values.push(filters[field]);
    }
  }

  const baseWhere = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let query = `${baseQuery} ${baseWhere} GROUP BY company.company_id`;

  // Sort
  if (!isSortEmpty) {
    const [field, dir] = sort.split(":");
    const validSorts = [...directFilters, "company_name", "company_updated_at", "company_created_at"];
    if (validSorts.includes(field) && ["asc", "desc"].includes(dir)) {
      orderBy = `ORDER BY company.${field} ${dir.toUpperCase()}`;
    }
  }

  query = `${query} ${orderBy}`;
  const [rows] = await db.query(query, values);
  return rows;
}
