import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DB_ACCESS_TYPE: z.enum(['mysql', 'postgres']).default('mysql'),
  DB_ACCESS_HOST: z.string().min(1, 'DB_ACCESS_HOST es requerido'),
  DB_ACCESS_PORT: z.coerce.number().default(3306),
  DB_ACCESS_USER: z.string().min(1, 'DB_ACCESS_USER es requerido'),
  DB_ACCESS_PASSWORD: z.string().default(''),
  DB_ACCESS_NAME: z.string().min(1, 'DB_ACCESS_NAME es requerido'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Error en variables de entorno:',
    parsed.error.flatten().fieldErrors,
  );
  throw new Error('Configuracion de entorno invalida. Revisa tu .env');
}

export const env = parsed.data;
