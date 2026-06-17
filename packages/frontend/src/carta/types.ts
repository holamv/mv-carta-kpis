/**
 * Tipos de dominio del modulo "Reporte Semanal de KPIs de Carta".
 *
 * Este modulo es independiente del resto de mv-quejas: vive enteramente bajo
 * `src/carta/*` (logica + datos) y `src/app/carta` + `src/app/api/carta`
 * (pagina y endpoints). No depende de la BD de quejas.
 */

/** Codigos de pais soportados por las reglas de carta. */
export type CountryCode = 'PE' | 'COL' | 'MX';

/** Clasificacion de proteina principal de un plato (para reglas de variedad). */
export type Proteina =
  | 'carne'
  | 'cerdo'
  | 'pescado'
  | 'pollo'
  | 'vegetariano'
  | 'otro';

/** Identificador de semana ISO en el formato del datalake: `${week}${year}` (ej. "192026"). */
export type SemanaId = string;

// ---------------------------------------------------------------------------
// Clasificacion de platos (config editable: meal_classification.json + sheet)
// ---------------------------------------------------------------------------

export interface MealClassification {
  meal_id: number;
  /** Nombre del plato (referencia humana; no se usa en calculos). */
  name?: string;
  proteina: Proteina;
  /** Si pertenece a la lista oficial de "platos estrella" (cambios fuera de lista => aprobacion CEO). */
  es_estrella: boolean;
  /** Pais al que aplica la clasificacion, si es especifica de pais. */
  country?: CountryCode;
}

// ---------------------------------------------------------------------------
// 1. Disponibilidad de carta
// ---------------------------------------------------------------------------

/** Estado de un plato en una tienda (cocina) en un momento dado. */
export interface MealAvailabilityRow {
  meal_id: number;
  meal_name: string;
  store_id: number;
  store_name: string;
  city: string;
  country: CountryCode;
  /** true = encendido/activo (status === 1), false = apagado. */
  is_available: boolean;
}

export interface StoreAvailability {
  store_id: number;
  store_name: string;
  city: string;
  country: CountryCode;
  total_meals: number;
  available_meals: number;
  availability_pct: number;
}

export interface TopOffMeal {
  meal_id: number;
  meal_name: string;
  /** En cuantas tiendas estuvo apagado durante la semana. */
  stores_off: number;
}

export interface AvailabilityReport {
  by_store: StoreAvailability[];
  by_city: Array<{ city: string; country: CountryCode; availability_pct: number }>;
  by_country: Array<{ country: CountryCode; availability_pct: number }>;
  top_off_meals: TopOffMeal[];
  overall_pct: number;
}

// ---------------------------------------------------------------------------
// 2. Foodcost teorico
// ---------------------------------------------------------------------------

export interface FoodcostWeekRow {
  country: CountryCode;
  /** Porcentaje de foodcost teorico (0-100). */
  foodcost_pct: number;
}

export interface FoodcostComparisonItem {
  country: CountryCode;
  current_pct: number | null;
  previous_pct: number | null;
  /** Diferencia en puntos porcentuales (current - previous). */
  delta_pp: number | null;
  /** true si current supera el umbral de alerta (40%). */
  exceeds_threshold: boolean;
}

export interface FoodcostReport {
  threshold_pct: number;
  current_week: SemanaId;
  previous_week: SemanaId;
  items: FoodcostComparisonItem[];
}

// ---------------------------------------------------------------------------
// 3. Platos nuevos lanzados
// ---------------------------------------------------------------------------

export interface NewMealPerformance {
  meal_id: number;
  meal_name: string;
  country: CountryCode;
  launch_week: SemanaId;
  /** Unidades vendidas en la semana. */
  units_sold: number;
  /** Foodcost real (%) si esta disponible. */
  real_foodcost_pct: number | null;
  /** Calificacion promedio (1-5) si esta disponible. */
  avg_rating: number | null;
}

// ---------------------------------------------------------------------------
// 4. Checklist de carta
// ---------------------------------------------------------------------------

/** Un plato tal como aparece en la carta de una semana, con metricas para el checklist. */
export interface CartaMeal {
  meal_id: number;
  meal_name: string;
  country: CountryCode;
  proteina: Proteina;
  es_estrella: boolean;
  /** Si esta en la lista oficial de estrella (para regla de aprobacion CEO). */
  en_lista_estrella_oficial: boolean;
  /** Calificacion promedio del plato (1-5), null si no hay data. */
  avg_rating: number | null;
  /** Semana de la ultima aparicion ANTERIOR a la actual (null si nunca antes). */
  last_appearance_week: SemanaId | null;
}

/** Receta/pesos de un plato (para la regla de pesos, basada en backend /alimentos). */
export interface PlateRecipe {
  meal_id: number;
  meal_name: string;
  /** Calorias objetivo del plato (ej. 600). */
  kcal: number;
  tipo: 'plato' | 'snack' | 'ensalada';
  /** Peso total cocido sin empaque (g). */
  peso_total_g: number | null;
  /** Proteina cocida (g). */
  proteina_g: number | null;
  /** Verduras/vegetales (g). */
  verduras_g: number | null;
  /** Arroz cocido (g). */
  arroz_g: number | null;
}

export type RuleSeverity = 'ok' | 'warning' | 'error';

export interface RuleResult {
  id: string;
  label: string;
  passed: boolean;
  severity: RuleSeverity;
  detail: string;
  /** Peso de la regla en el % de cumplimiento. */
  weight: number;
}

export interface ChecklistAlert {
  rule_id: string;
  severity: RuleSeverity;
  message: string;
  /** Sugerencia accionable (ej. plato candidato a reemplazo). */
  suggestion?: string;
  meal_id?: number;
}

export interface ChecklistReport {
  country: CountryCode;
  week: SemanaId;
  /** % de cumplimiento general (0-100), ponderado por las reglas evaluables. */
  compliance_pct: number;
  rules: RuleResult[];
  alerts: ChecklistAlert[];
  /** Reglas que no se pudieron evaluar por falta de datos (ej. pesos sin recetas). */
  not_evaluated: string[];
}

// ---------------------------------------------------------------------------
// 5. Mystery orders (pendiente de integracion)
// ---------------------------------------------------------------------------

export interface MysteryReport {
  status: 'pending_integration';
  message: string;
  pass_rate_pct: number | null;
}

// ---------------------------------------------------------------------------
// Reporte consolidado
// ---------------------------------------------------------------------------

/** Marca de cada seccion: si la fuente de datos real estuvo disponible. */
export interface SectionMeta {
  /** true si los datos provienen de una fuente real conectada. */
  source_connected: boolean;
  /** Mensaje cuando la fuente no esta disponible. */
  note?: string;
}

export interface WeeklyCartaReport {
  generated_at: string;
  week: SemanaId;
  previous_week: SemanaId;
  filters: { country?: CountryCode; city?: string };
  availability: { meta: SectionMeta; data: AvailabilityReport };
  foodcost: { meta: SectionMeta; data: FoodcostReport };
  new_meals: { meta: SectionMeta; data: NewMealPerformance[] };
  checklist: { meta: SectionMeta; data: ChecklistReport[] };
  mystery: { meta: SectionMeta; data: MysteryReport };
}

// ---------------------------------------------------------------------------
// Wrapper de respuesta estandar de MV
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; code: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
