import { ChecklistValidator } from "../calculations/checklist.validator";
import type { ChecklistInput, ChecklistOutput } from "../calculations/types";
import type { MealForChecklist } from "../calculations/types";
import type { Country } from "../types";
import { PAIS_REGLAS } from "../config";

export class ChecklistAdapter {
  async getChecklistForWeek(pais: Country, semana: string): Promise<ChecklistOutput> {
    try {
      const platos = await this.fetchPlatosFromDatalake(pais, semana);
      
      if (platos.length === 0) {
        const config = PAIS_REGLAS[pais];
        return {
          pais,
          cumplimiento_pct: 0,
          alertas: [{
            regla: "data",
            severidad: "warning",
            mensaje: "No hay datos disponibles para esta semana y país",
          }],
          detalle_reglas: {
            calificacion: { pasada: false, promedio: 0 },
            variedad: {
              pasada: false,
              carne: { actual: 0, minimo: config.variedad_minima.carne },
              cerdo: { actual: 0, minimo: config.variedad_minima.cerdo },
              pescado: { actual: 0, minimo: config.variedad_minima.pescado },
              estrella: { actual: 0, minimo: config.variedad_minima.estrella, maximo: config.estrella_maxima },
            },
            rotacion: { pasada: false, obsoletos: [] },
            pollo: { pasada: false, frecuencia: 0, limite: config.pollo_max_semana },
            pesos: { pasada: false, platos_con_problema: [] },
          },
        };
      }

      const validator = new ChecklistValidator(pais);
      const weekNum = parseInt(semana.split('-')[0].substring(1), 10);
      const resultado = validator.validate({
        pais,
        semana_numero: weekNum,
        platos,
        semanas_historico: 4,
      });

      return resultado;
    } catch (error) {
      console.error(`[ChecklistAdapter] Error:`, error);
      throw error;
    }
  }

  private async fetchPlatosFromDatalake(pais: Country, semana: string): Promise<MealForChecklist[]> {
    try {
      const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

      const response = await fetch(
        `${SUPABASE_URL}/meals?select=meal_id,meal_name,protein_type,is_star,protein_gr&country=eq.${pais}&limit=500`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );

      if (!response.ok) return [];
      const meals = await response.json();

      const feedbackResponse = await fetch(
        `${SUPABASE_URL}/meal_feedbacks?select=meal_id,rating&limit=5000`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );

      const feedbacks = feedbackResponse.ok ? await feedbackResponse.json() : [];
      const ratingsByMeal = feedbacks.reduce((acc: Record<number, number[]>, f: any) => {
        if (!acc[f.meal_id]) acc[f.meal_id] = [];
        acc[f.meal_id].push(f.rating);
        return acc;
      }, {});

      return meals.map((m: any) => ({
        meal_id: m.meal_id,
        nombre: m.meal_name,
        proteina: m.protein_type,
        es_estrella: m.is_star,
        calificacion_promedio: ratingsByMeal[m.meal_id]
          ? ratingsByMeal[m.meal_id].reduce((a: number, b: number) => a + b, 0) / ratingsByMeal[m.meal_id].length
          : 0,
        proteina_gr: m.protein_gr,
      }));
    } catch (err) {
      console.warn(`[ChecklistAdapter] Supabase fetch failed:`, err);
      return [];
    }
  }
}
