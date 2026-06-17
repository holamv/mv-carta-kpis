import { FoodcostCalculator } from "../calculations/foodcost.calculator";
import type { FoodcostOutput } from "../calculations/types";
import type { Country } from "../types";
import { getPreviousWeek } from "../utils";
import { COUNTRY_ID_MAP, buildDateRangeFilter } from "./utils";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export class FoodcostAdapter {
  async getFoodcostForWeek(semana: string): Promise<FoodcostOutput> {
    try {
      const semanaprev = getPreviousWeek(semana);

      // Usar food_cost_pct directo de meals (costo_teorico_local aún está en NULL)
      const datos_semana_actual = await this.getFoodcostForSemana(semana);
      const datos_semana_anterior = await this.getFoodcostForSemana(semanaprev);

      const calculator = new FoodcostCalculator();
      return calculator.calculate({
        semana_actual: semana,
        semana_anterior: semanaprev,
        datos_semana_actual,
        datos_semana_anterior,
      });
    } catch (error) {
      console.error(`[FoodcostAdapter] Error:`, error);
      return {
        semana_actual: semana,
        semana_anterior: "",
        comparativos: [],
        alertas: [`Error: ${error instanceof Error ? error.message : 'desconocido'}`],
      };
    }
  }

  private async getFoodcostForSemana(semana: string): Promise<Record<Country, number>> {
    try {
      // NOTA: costo_teorico_local está en NULL en meal_orders_daily
      // Fallback: usar food_cost_pct de meals (es estático pero es lo disponible)
      const countryId = Object.entries(COUNTRY_ID_MAP).find(([_, id]) => id === 1)?.[0];

      const response = await fetch(
        `${SUPABASE_URL}/meals?select=country_id,food_cost_pct&limit=2000`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Foodcost fetch failed: ${response.status}`);
        return { PE: 0, CO: 0, MX: 0 };
      }

      const meals = await response.json();

      // Agrupar por country_id y calcular promedio de food_cost_pct
      const costByCountry: Record<number, number[]> = { 1: [], 2: [], 3: [] };

      meals.forEach((meal: any) => {
        if (meal.food_cost_pct) {
          if (!costByCountry[meal.country_id]) {
            costByCountry[meal.country_id] = [];
          }
          costByCountry[meal.country_id].push(meal.food_cost_pct);
        }
      });

      // Calcular promedio por país
      const result: Record<Country, number> = { PE: 0, CO: 0, MX: 0 };
      Object.entries(costByCountry).forEach(([countryId, costs]) => {
        if (costs.length > 0) {
          const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
          const countryCode = COUNTRY_ID_MAP[parseInt(countryId)];
          if (countryCode) {
            result[countryCode] = Math.round(avgCost * 100) / 100;
          }
        }
      });

      return result;
    } catch (error) {
      console.warn(`[FoodcostAdapter] Supabase Error:`, error);
      return { PE: 0, CO: 0, MX: 0 };
    }
  }
}
