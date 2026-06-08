import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * Pool de conexiones MySQL.
 *
 * NOTA: este proyecto esta configurado para MySQL (DB_ACCESS_TYPE=mysql).
 * Si necesitas Postgres, instala `pg` y reemplaza esta implementacion por
 * un Pool de `pg`, manteniendo la misma interfaz `query()`.
 */
export const pool = mysql.createPool({
  host: env.DB_ACCESS_HOST,
  port: env.DB_ACCESS_PORT,
  user: env.DB_ACCESS_USER,
  password: env.DB_ACCESS_PASSWORD,
  database: env.DB_ACCESS_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

/**
 * Helper para queries parametrizados.
 * SIEMPRE usar placeholders (?) — nunca interpolar valores en el SQL.
 */
export type QueryParam = string | number | boolean | null | Date;

export async function query<T = unknown>(
  sql: string,
  params: QueryParam[] = [],
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function healthCheckDb(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
