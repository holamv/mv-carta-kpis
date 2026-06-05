import { z } from 'zod';

/**
 * Tipos de queja/reclamo soportados.
 * Ajustar segun las categorias reales del negocio.
 */
export const TIPOS_QUEJA = [
  'producto',
  'entrega',
  'atencion',
  'facturacion',
  'app',
  'otro',
] as const;

export const tipoQuejaSchema = z.enum(TIPOS_QUEJA);
export type TipoQueja = z.infer<typeof tipoQuejaSchema>;

/**
 * Estados del ciclo de vida de una queja.
 */
export const ESTADOS_QUEJA = [
  'pendiente',
  'en_proceso',
  'resuelta',
  'cerrada',
] as const;

export const estadoQuejaSchema = z.enum(ESTADOS_QUEJA);
export type EstadoQueja = z.infer<typeof estadoQuejaSchema>;

/**
 * Payload que envia el cliente al crear una queja.
 * Es la unica fuente de verdad para validacion en front y back.
 */
export const crearQuejaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre es demasiado largo'),
  email: z
    .string()
    .trim()
    .email('Email invalido')
    .max(180, 'El email es demasiado largo'),
  telefono: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal('')),
  tipo: tipoQuejaSchema,
  pedidoId: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal('')),
  mensaje: z
    .string()
    .trim()
    .min(10, 'Cuentanos un poco mas (minimo 10 caracteres)')
    .max(2000, 'El mensaje es demasiado largo (maximo 2000 caracteres)'),
});

export type CrearQuejaInput = z.infer<typeof crearQuejaSchema>;

/**
 * Representacion completa de una queja persistida.
 */
export interface Queja {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  tipo: TipoQueja;
  pedidoId: string | null;
  mensaje: string;
  estado: EstadoQueja;
  creadoEn: string; // ISO 8601
  actualizadoEn: string; // ISO 8601
}

export const ETIQUETAS_TIPO: Record<TipoQueja, string> = {
  producto: 'Producto',
  entrega: 'Entrega',
  atencion: 'Atencion al cliente',
  facturacion: 'Facturacion',
  app: 'App / Web',
  otro: 'Otro',
};

export const ETIQUETAS_ESTADO: Record<EstadoQueja, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
};
