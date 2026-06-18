import type { Country, PaisReglas } from './types';

// MAPEO PAÍS → CIUDAD → BRANCH_OFFICE_ID (según guía Leo)
export const CITY_MAPPING: Record<Country, Record<string, number>> = {
  PE: {
    Lima: 2,
    Piura: 1,
  },
  MX: {
    CDMX: 3,
    GDL: 5,
    Monterrey: 6,
  },
  CO: {
    Bogotá: 8,
  },
};

// Inverso: branch_office_id → { city, country }
export const BRANCH_OFFICE_REVERSE: Record<number, { city: string; country: Country }> = {
  1: { city: "Piura", country: "PE" },
  2: { city: "Lima", country: "PE" },
  3: { city: "CDMX", country: "MX" },
  5: { city: "GDL", country: "MX" },
  6: { city: "Monterrey", country: "MX" },
  8: { city: "Bogotá", country: "CO" },
};

/**
 * Arma semana_id SIN CEROS: semana 25 año 2026 = "252026", semana 9 = "92026"
 * (Leo: NUNCA "0252026" o "092026")
 */
export function buildSemanaId(weekNum: number, year: number): string {
  return `${weekNum}${year}`;
}

/**
 * Parsea "W25-2026" → { week: 25, year: 2026 }
 */
export function parseSemana(semanaStr: string): { week: number; year: number } {
  const [weekPart, yearPart] = semanaStr.split("-");
  return {
    week: parseInt(weekPart.substring(1), 10),
    year: parseInt(yearPart, 10),
  };
}

// Reglas de validación de carta por país
export const PAIS_REGLAS: Record<Country, PaisReglas> = {
  PE: {
    codigo: 'PE',
    nombre: 'Perú',
    variedad_minima: {
      carne: 2,
      cerdo: 2,
      pescado: 2,
      estrella: 4,
    },
    estrella_maxima: 5,
    pollo_max_semana: 7,
    rotacion_dias: {
      estrella: 14,
      otros: 28,
    },
  },
  CO: {
    codigo: 'CO',
    nombre: 'Colombia',
    variedad_minima: {
      carne: 2,
      cerdo: 2,
      pescado: 2,
      estrella: 4,
    },
    estrella_maxima: 5,
    pollo_max_semana: 7,
    rotacion_dias: {
      estrella: 14,
      otros: 28,
    },
  },
  MX: {
    codigo: 'MX',
    nombre: 'México',
    variedad_minima: {
      carne: 3,
      cerdo: 2,
      pescado: 2,
      estrella: 3,
    },
    estrella_maxima: 4,
    pollo_max_semana: 6,
    rotacion_dias: {
      estrella: 14,
      otros: 28,
    },
  },
};

// Umbrales de validación
export const UMBRALES = {
  CALIFICACION_MINIMA: 4.65,
  FOODCOST_ALERTA_PCT: 40,
  PESO_MINIMO_PRINCIPAL: 350, // gramos (600kcal)
  PESO_MINIMO_ENSALADA: 300,
  PESO_MINIMO_SNACK: 120,
  PROTEINA_MINIMA: 70, // gramos cocida
  VERDURAS_MINIMA: 80, // gramos
  ARROZ_MAXIMO: 140, // gramos cocido
  DISPONIBILIDAD_ALERTA: 70, // % mínimo
};

// Categorías de platos
export const MEAL_CATEGORIES = [
  'Platos fuertes',
  'Ensaladas',
  'Bowls',
  'Wraps',
  'Hamburguesas',
  'Snacks',
  'Bebidas',
  'Postres',
] as const;
