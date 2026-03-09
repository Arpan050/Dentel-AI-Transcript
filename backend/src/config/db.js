import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               parseInt(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || "dental_ai",
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "Z",       // store UTC
  decimalNumbers:     true,
});

// Verify connection on startup
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  }
}

export default pool;
