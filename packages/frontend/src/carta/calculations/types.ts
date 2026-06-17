// Tipos de entrada/salida para los motors de cálculo puro
// Sin dependencias externas — solo lógica de negocio

import type { Country, Protein, ChecklistAlerta } from '../types';

// ====== CHECKLIST VALIDATOR ======
export interface MealForChecklist {
  meal_id: number;
  nombre: string;
  proteina: Protein;
  es_estrella: boolean;
  calificacion_promedio: number; // 0-5
  ultima_aparicion_semana?: number; // semana que apareció por última vez (número)
  veces_pollo_semana?: number; // cuántas veces aparece pollo en la semana
  peso_total_gr?: number; // peso cocido sin empaque
  proteina_gr?: number; // proteína cocida
  verduras_gr?: number;
  arroz_gr?: number; // solo para platos 600kcal
}

export interface ChecklistInput {
  pais: Country;
  semana_numero: number; // W (número de semana)
  platos: MealForChecklist[];
  semanas_historico?: number; // cuántas semanas atrás verificar rotación (default 4)
}

export interface ChecklistOutput {
  pais: Country;
  cumplimiento_pct: number; // 0-100
  alertas: ChecklistAlerta[];
  detalle_reglas: {
    calificacion: {
      pasada: boolean;
      promedio: number;
      peor_plato?: string;
    };
    variedad: {
      pasada: boolean;
      carne: { actual: number; minimo: number };
      cerdo: { actual: number; minimo: number };
      pescado: { actual: number; minimo: number };
      estrella: { actual: number; minimo: number; maximo: number };
    };
    rotacion: {
      pasada: boolean;
      obsoletos: string[]; // platos que no rotaron lo suficiente
    };
    pollo: {
      pasada: boolean;
      frecuencia: number;
      limite: number;
    };
    pesos: {
      pasada: boolean;
      platos_con_problema: string[];
    };
  };
}

// ====== AVAILABILITY CALCULATOR ======
export interface TiendaDispData {
  tienda_id: number;
  tienda_nombre: string;
  ciudad: string;
  pais: Country;
  cocina_id: number;
  platos_activos: number;
  platos_total: number;
}

export interface AvailabilityInput {
  semana: string;
  pais?: Country;
  tiendas: TiendaDispData[];
}

export interface AvailabilityOutput {
  semana: string;
  pais_filtro?: Country;
  datos_tiendas: {
    tienda_id: number;
    tienda_nombre: string;
    ciudad: string;
    porcentaje: number;
    platos_activos: number;
    platos_total: number;
  }[];
  porcentaje_promedio_general: number;
  porcentaje_promedio_por_pais: Record<Country, number>;
  alertas: string[];
}

// ====== FOODCOST CALCULATOR ======
export interface FoodcostInput {
  semana_actual: string;
  semana_anterior: string;
  datos_semana_actual: Record<Country, number>; // Country -> foodcost_pct
  datos_semana_anterior: Record<Country, number>;
}

export interface FoodcostOutput {
  semana_actual: string;
  semana_anterior: string;
  comparativos: {
    pais: Country;
    foodcost_actual: number;
    foodcost_anterior: number;
    diferencia_pct: number;
    alerta: boolean; // true si > 40%
  }[];
  alertas: string[];
}

// ====== NUEVOS PLATOS ANALYZER ======
export interface NuevoPlatoData {
  meal_id: number;
  nombre: string;
  categoria: string;
  pais: Country;
  fecha_lanzamiento: string; // ISO date
  ventas_unidades: number;
  foodcost_pct: number;
  calificacion_promedio: number;
}

export interface NuevosPlatosInput {
  semana: string;
  pais?: Country;
  platos: NuevoPlatoData[];
  dias_lanzamiento_minimo?: number; // default 7 (últimos 7 días)
}

export interface NuevosPlatosOutput {
  semana: string;
  pais_filtro?: Country;
  platos: {
    meal_id: number;
    nombre: string;
    categoria: string;
    pais: Country;
    dias_en_carta: number;
    ventas_unidades: number;
    foodcost_pct: number;
    calificacion_promedio: number;
    performance: 'arriba_promedio' | 'normal' | 'abajo_promedio';
    notas?: string;
  }[];
  conteo_total: number;
}

// ====== REPORT CONSOLIDATOR ======
export interface ReportConsolidatorInput {
  semana: string;
  pais_filtro?: Country;
  ciudad_filtro?: string;
  checklistOutput: ChecklistOutput[];
  availabilityOutput: AvailabilityOutput;
  foodcostOutput: FoodcostOutput;
  nuevosPlatos: NuevosPlatosOutput;
  mysteryOrders?: {
    estado: 'pendiente' | 'completado';
    datos?: Record<Country, { pass_rate: number; total: number }>;
  };
}

export interface ReportConsolidatorOutput {
  generado_en: string;
  semana: string;
  pais_filtro?: Country;
  ciudad_filtro?: string;
  checklist_cumplimiento_general: number; // promedio paises
  checklist_alertas_criticas: number;
  availability_promedio: number;
  foodcost_alertas: number;
  nuevos_platos_count: number;
  resumen_ejecutivo: string;
}
