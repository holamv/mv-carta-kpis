import { FoodcostCalculator } from "../calculations/foodcost.calculator";
import type { FoodcostOutput } from "../calculations/types";
import type { Country } from "../types";
import { getPreviousWeek } from "../utils";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export class FoodcostAdapter {
  async getFoodcostForWeek(semana: string): Promise<FoodcostOutput> {
    try {
      const semanaprev = getPreviousWeek(semana);

      // Fórmula: SUM(costo_teorico_local)/SUM(precio_local)*100
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
      // Extraer año y semana de formato "W24-2026"
      const [weekPart, yearPart] = semana.split('-');
      const weekNum = parseInt(weekPart.substring(1), 10);
      const year = parseInt(yearPart, 10);

      // Query: SUM(costo_teorico_local)/SUM(precio_local)*100 por país
      // Filtrar complementos (bebidas/postres) que salen >100%
      const response = await fetch(
        `${SUPABASE_URL}/meal_orders_daily?select=country_id,country,costo_teorico_local,precio_local&limit=10000`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return { PE: 0, CO: 0, MX: 0 };

      const orders = await response.json();

      // Agrupar por país y calcular foodcost
      const foodcostByCountry: Record<string, { totalCosto: number; totalPrecio: number }> = {};

      orders.forEach((order: any) => {
        const country = order.country as Country;
        if (!foodcostByCountry[country]) {
          foodcostByCountry[country] = { totalCosto: 0, totalPrecio: 0 };
        }
        foodcostByCountry[country].totalCosto += order.costo_teorico_local || 0;
        foodcostByCountry[country].totalPrecio += order.precio_local || 0;
      });

      // Calcular porcentaje por país
      const result: Record<Country, number> = { PE: 0, CO: 0, MX: 0 };
      Object.entries(foodcostByCountry).forEach(([country, data]) => {
        if (data.totalPrecio > 0) {
          const pct = (data.totalCosto / data.totalPrecio) * 100;
          // Filtrar valores >100% (complementos) — usar mínimo 100 como máximo
          result[country as Country] = Math.min(pct, 100);
        }
      });

      return result;
    } catch (error) {
      console.warn(`[FoodcostAdapter] Supabase Error:`, error);
      return { PE: 0, CO: 0, MX: 0 };
    }
  }
}
