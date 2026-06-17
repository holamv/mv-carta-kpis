import { AvailabilityCalculator } from "../calculations/availability.calculator";
import type { AvailabilityOutput, TiendaDispData } from "../calculations/types";
import type { Country } from "../types";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export class AvailabilityAdapter {
  async getAvailabilityForWeek(semana: string, pais?: Country): Promise<AvailabilityOutput> {
    try {
      const tiendas = await this.getTiendasFromSupabase(pais);

      const calculator = new AvailabilityCalculator();
      return calculator.calculate({
        semana,
        pais,
        tiendas,
      });
    } catch (error) {
      console.error(`[AvailabilityAdapter] Error:`, error);
      return {
        semana,
        pais_filtro: pais,
        datos_tiendas: [],
        porcentaje_promedio_general: 0,
        porcentaje_promedio_por_pais: { PE: 0, CO: 0, MX: 0 },
        alertas: [`Error: ${error instanceof Error ? error.message : 'desconocido'}`],
      };
    }
  }

  private async getTiendasFromSupabase(pais?: Country): Promise<TiendaDispData[]> {
    try {
      // Query: tiendas + contar platos activos vs total por tienda
      const countryFilter = pais ? `&country=eq.${pais}` : "";

      const response = await fetch(
        `${SUPABASE_URL}/stores?select=*${countryFilter}&limit=200`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Supabase stores: ${response.status}`);
      const stores = await response.json();

      // Contar platos activos y totales
      const mealResponse = await fetch(
        `${SUPABASE_URL}/meals?select=country,is_active${countryFilter}&limit=2000`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!mealResponse.ok) throw new Error(`Supabase meals: ${mealResponse.status}`);
      const meals = await mealResponse.json();

      const totalMeals = meals.length;
      const activeMeals = meals.filter((m: any) => m.is_active === true).length;

      return stores.map((s: any) => ({
        tienda_id: s.store_id,
        tienda_nombre: s.store_name,
        ciudad: s.city,
        pais: s.country as Country,
        cocina_id: s.cocina_id,
        platos_activos: activeMeals,
        platos_total: totalMeals,
      }));
    } catch (error) {
      console.warn(`[AvailabilityAdapter] Supabase Error:`, error);
      return [];
    }
  }
}
