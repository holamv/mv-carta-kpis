import mysql from "mysql2/promise";
import { validateEnvVar, hasEnvVar } from "./utils";

interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function getDBConfig(): DBConfig {
  if (!hasEnvVar("DB_ACCESS_HOST")) {
    throw new Error("DB_ACCESS_* environment variables not configured");
  }

  return {
    host: validateEnvVar("DB_ACCESS_HOST"),
    port: parseInt(validateEnvVar("DB_ACCESS_PORT") || "3306"),
    user: validateEnvVar("DB_ACCESS_USER"),
    password: validateEnvVar("DB_ACCESS_PASSWORD"),
    database: validateEnvVar("DB_ACCESS_NAME"),
  };
}

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDBConfig();
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      timezone: "+00:00",
    });
  }
  return pool;
}

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
