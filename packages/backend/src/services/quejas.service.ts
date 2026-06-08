import type {
  CrearQuejaInput,
  EstadoQueja,
  Queja,
  TipoQueja,
} from '@mv-quejas/shared';
import { query, type QueryParam } from '../config/database.js';

interface QuejaRow {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  tipo: TipoQueja;
  pedido_id: string | null;
  mensaje: string;
  estado: EstadoQueja;
  creado_en: Date;
  actualizado_en: Date;
}

function mapRow(row: QuejaRow): Queja {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    tipo: row.tipo,
    pedidoId: row.pedido_id,
    mensaje: row.mensaje,
    estado: row.estado,
    creadoEn: new Date(row.creado_en).toISOString(),
    actualizadoEn: new Date(row.actualizado_en).toISOString(),
  };
}

export async function crearQueja(input: CrearQuejaInput): Promise<Queja> {
  const telefono = input.telefono ? input.telefono : null;
  const pedidoId = input.pedidoId ? input.pedidoId : null;

  const result = await query<{ insertId: number }>(
    `INSERT INTO quejas (nombre, email, telefono, tipo, pedido_id, mensaje, estado)
     VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
    [input.nombre, input.email, telefono, input.tipo, pedidoId, input.mensaje],
  );

  // mysql2 devuelve insertId en el ResultSetHeader; lo recuperamos via la fila.
  const insertId = (result as unknown as { insertId: number }).insertId;
  const created = await obtenerQuejaPorId(insertId);
  if (!created) {
    throw new Error('No se pudo recuperar la queja recien creada');
  }
  return created;
}

export async function obtenerQuejaPorId(id: number): Promise<Queja | null> {
  const rows = await query<QuejaRow>(
    `SELECT id, nombre, email, telefono, tipo, pedido_id, mensaje, estado, creado_en, actualizado_en
     FROM quejas WHERE id = ? LIMIT 1`,
    [id],
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export interface ListarQuejasOpts {
  estado?: EstadoQueja;
  tipo?: TipoQueja;
  limit?: number;
  offset?: number;
}

export async function listarQuejas(
  opts: ListarQuejasOpts = {},
): Promise<Queja[]> {
  const conditions: string[] = [];
  const params: QueryParam[] = [];

  if (opts.estado) {
    conditions.push('estado = ?');
    params.push(opts.estado);
  }
  if (opts.tipo) {
    conditions.push('tipo = ?');
    params.push(opts.tipo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);

  const rows = await query<QuejaRow>(
    `SELECT id, nombre, email, telefono, tipo, pedido_id, mensaje, estado, creado_en, actualizado_en
     FROM quejas ${where}
     ORDER BY creado_en DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return rows.map(mapRow);
}
