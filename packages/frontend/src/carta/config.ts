import type { Country, PaisReglas } from './types';

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
