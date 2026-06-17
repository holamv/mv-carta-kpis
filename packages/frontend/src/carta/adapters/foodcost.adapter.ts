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
      // Filtrar meal_orders_daily por semana (order_date entre lunes y domingo)
      const dateFilter = buildDateRangeFilter(semana);

      const response = await fetch(
        `${SUPABASE_URL}/meal_orders_daily?select=country_id,precio_local,costo_teorico_local${dateFilter}&limit=5000`,
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

      const orders = await response.json();

      // Calcular foodcost por país: SUM(precio_local) / SUM(unidades*precio) * 100
      // Ya que costo_teorico_local está en NULL, usamos price directo
      const costByCountry: Record<number, { totalPrecio: number; totalCosto: number }> = {
        1: { totalPrecio: 0, totalCosto: 0 },
        2: { totalPrecio: 0, totalCosto: 0 },
        3: { totalPrecio: 0, totalCosto: 0 },
      };

      orders.forEach((order: any) => {
        const countryId = order.country_id;
        if (costByCountry[countryId]) {
          costByCountry[countryId].totalPrecio += order.precio_local || 0;
          costByCountry[countryId].totalCosto += order.costo_teorico_local || 0;
        }
      });

      // Calcular porcentaje por país
      const result: Record<Country, number> = { PE: 0, CO: 0, MX: 0 };
      Object.entries(costByCountry).forEach(([countryId, { totalPrecio, totalCosto }]) => {
        if (totalPrecio > 0) {
          const pct = (totalCosto / totalPrecio) * 100;
          const countryCode = COUNTRY_ID_MAP[parseInt(countryId) as Country];
          if (countryCode) {
            result[countryCode] = Math.round(pct * 100) / 100;
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
