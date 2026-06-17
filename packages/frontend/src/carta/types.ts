// Tipos de dominio para el módulo de reporte de KPIs de carta

export type Country = 'PE' | 'MX' | 'CO';
export type Protein = 'carne' | 'cerdo' | 'pescado' | 'pollo' | 'otro';
export type ReportSection = 'disponibilidad' | 'foodcost' | 'platos-nuevos' | 'checklist' | 'mystery';

// Estructura de disponibilidad por tienda
export interface AvailabilityData {
  tienda_id: number;
  tienda_nombre: string;
  ciudad: string;
  pais: Country;
  platos_activos: number;
  platos_totales: number;
  porcentaje_disponibilidad: number;
  platos_apagados: string[]; // top 5 apagados
}

export interface AvailabilityReport {
  semana: string;
  datos_tiendas: AvailabilityData[];
  porcentaje_promedio_pais: Record<Country, number>;
  alertas: string[];
}

// Estructura de foodcost
export interface FoodcostData {
  pais: Country;
  semana_actual: number;
  semana_anterior: number;
  diferencia_pct: number;
  alerta: boolean; // true si > 40%
}

export interface FoodcostReport {
  semana: string;
  datos_por_pais: FoodcostData[];
  alertas: string[];
}

// Estructura de platos nuevos
export interface NuevoPlato {
  meal_id: number;
  nombre: string;
  categoria: string;
  pais: Country;
  fecha_lanzamiento: string;
  ventas_unidades: number;
  foodcost_pct: number;
  calificacion_promedio: number;
  desviacion: string; // 'arriba' | 'normal' | 'abajo'
}

export interface NuevosPlatos {
  semana: string;
  platos: NuevoPlato[];
}

// Estructura de checklist — reglas por país
export interface ChecklistAlerta {
  regla: string;
  severidad: 'info' | 'warning' | 'error';
  mensaje: string;
  detalles?: Record<string, unknown>;
}

export interface ChecklistResultado {
  pais: Country;
  cumplimiento_pct: number;
  alertas: ChecklistAlerta[];
  metricas: {
    calificacion_promedio: number;
    platos_bajo_465: string[]; // peor calificado primero
    variedad_carne: number;
    variedad_cerdo: number;
    variedad_pescado: number;
    variedad_estrella: number;
    pollo_frecuencia: number;
    rotacion_obsoletos: string[]; // platos sin aparecer > N semanas
  };
}

export interface ChecklistReport {
  semana: string;
  resultados_por_pais: ChecklistResultado[];
  cumplimiento_promedio: number;
}

// Estructura de mystery orders (pendiente integración)
export interface MysteryOrdersReport {
  semana: string;
  estado: 'pendiente' | 'completado';
  datos_por_pais?: Record<Country, { pass_rate: number; total: number }>;
  mensaje?: string;
}

// Reporte consolidado
export interface CartaKPIReport {
  generado_en: string;
  semana: string;
  pais_filtro?: Country;
  ciudad_filtro?: string;
  disponibilidad: AvailabilityReport;
  foodcost: FoodcostReport;
  platos_nuevos: NuevosPlatos;
  checklist: ChecklistReport;
  mystery_orders: MysteryOrdersReport;
}

// Respuesta estándar de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

// Configuración de reglas por país
export interface PaisReglas {
  codigo: Country;
  nombre: string;
  variedad_minima: {
    carne: number;
    cerdo: number;
    pescado: number;
    estrella: number;
  };
  estrella_maxima: number;
  pollo_max_semana: number;
  rotacion_dias: {
    estrella: number;
    otros: number;
  };
}

// Clasificación de plato
export interface MealClassification {
  meal_id: number;
  nombre: string;
  proteina: Protein;
  es_estrella: boolean;
  fecha_lanzamiento?: string;
}
