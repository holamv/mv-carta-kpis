import { AvailabilityCalculator } from "../calculations/availability.calculator";
import type { AvailabilityOutput, TiendaDispData } from "../calculations/types";
import type { Country } from "../types";
import { COUNTRY_ID_MAP, ID_COUNTRY_MAP, buildDateRangeFilter } from "./utils";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export class AvailabilityAdapter {
  async getAvailabilityForWeek(semana: string, pais?: Country): Promise<AvailabilityOutput> {
    try {
      const tiendas = await this.getTiendasFromSupabase(pais, semana);

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

  private async getTiendasFromSupabase(pais?: Country, semana?: string): Promise<TiendaDispData[]> {
    try {
      // Obtener country_id para filtro
      const countryId = pais ? COUNTRY_ID_MAP[pais] : undefined;
      const storesFilter = countryId ? `&country_id=eq.${countryId}` : "";

      // Fetch stores ACTIVAS (is_active=true)
      const response = await fetch(
        `${SUPABASE_URL}/stores?select=store_id,store_name,city,country_id,cocina_id${storesFilter}&is_active=eq.true&limit=200`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Supabase stores: ${response.status}`);
      const stores = await response.json();

      // Contar platos disponibles (producidos/vendidos esa semana en meal_orders_daily)
      const dateFilter = semana ? buildDateRangeFilter(semana) : "";
      const mealsFilter = countryId ? `&country_id=eq.${countryId}` : "";

      const ordersResponse = await fetch(
        `${SUPABASE_URL}/meal_orders_daily?select=meal_id,store_id${mealsFilter}${dateFilter}&limit=5000`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!ordersResponse.ok) throw new Error(`Supabase orders: ${ordersResponse.status}`);
      const orders = await ordersResponse.json();

      // Obtener total de platos activos en esa semana
      const mealsResponse = await fetch(
        `${SUPABASE_URL}/meals?select=meal_id,is_active${mealsFilter}&limit=2000`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!mealsResponse.ok) throw new Error(`Supabase meals: ${mealsResponse.status}`);
      const meals = await mealsResponse.json();

      const totalMeals = meals.filter((m: any) => m.is_active === true).length;
      // Contar platos únicos que fueron disponibles (vendidos) esa semana
      const availableMealIds = new Set(orders.map((o: any) => o.meal_id));
      const availableMeals = availableMealIds.size;

      return stores.map((s: any) => ({
        tienda_id: s.store_id,
        tienda_nombre: s.store_name,
        ciudad: s.city,
        pais: ID_COUNTRY_MAP[s.country_id] || ("PE" as Country),
        cocina_id: s.cocina_id,
        platos_activos: availableMeals,
        platos_total: totalMeals,
      }));
    } catch (error) {
      console.warn(`[AvailabilityAdapter] Supabase Error:`, error);
      return [];
    }
  }
}
