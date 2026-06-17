import type { Country } from "../types";

// Mapeo: country code -> country_id
export const COUNTRY_ID_MAP: Record<Country, number> = {
  PE: 1,
  CO: 2,
  MX: 3,
};

// Mapeo inverso: country_id -> country code
export const ID_COUNTRY_MAP: Record<number, Country> = {
  1: "PE",
  2: "CO",
  3: "MX",
};

/**
 * Convierte W24-2026 a rango de fechas ISO (lunes a domingo)
 * Retorna: { start: "2026-06-01", end: "2026-06-07" }
 */
export function weekStringToDateRange(weekString: string): {
  start: string;
  end: string;
} {
  const [weekPart, yearPart] = weekString.split("-");
  const weekNum = parseInt(weekPart.substring(1), 10);
  const year = parseInt(yearPart, 10);

  // ISO week: lunes = día 1
  // Calcular fecha del lunes de la semana
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const firstMonday = new Date(
    year,
    0,
    4 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );

  // Calcular lunes de la semana específica
  const monday = new Date(firstMonday);
  monday.setDate(monday.getDate() + (weekNum - 1) * 7);

  // Calcular domingo
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  // Formatear como YYYY-MM-DD
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
}

/**
 * Construye filtro Supabase para rango de fechas
 * Ej: "&order_date=gte.2026-06-01&order_date=lte.2026-06-07"
 */
export function buildDateRangeFilter(weekString: string): string {
  const { start, end } = weekStringToDateRange(weekString);
  return `&order_date=gte.${start}&order_date=lte.${end}`;
}
