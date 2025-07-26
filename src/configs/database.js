import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT } = process.env;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: PORT,
  // timezone: "Z",
});

const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully!");

    await connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

testConnection();

export default db;
