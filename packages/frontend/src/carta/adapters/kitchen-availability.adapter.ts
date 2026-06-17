import type { Country } from "../types";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

// Mapeo: country_id -> Country code
const COUNTRY_ID_MAP: Record<number, Country> = {
  1: "PE",
  2: "CO",
  3: "MX",
};

export interface KitchenAvailabilityData {
  city: string;
  catering_name: string;
  catering_level: "A" | "B" | "C";
  disponibles: number;
  carta_total: number;
  disponibilidad_pct: number;
}

export interface KitchenAvailabilityOutput {
  semana: string;
  pais?: Country;
  data: KitchenAvailabilityData[];
  promedio_general: number;
  promedio_always_on: number; // Level A+B
  alertas: string[];
}

export class KitchenAvailabilityAdapter {
  async getKitchenAvailabilityForWeek(
    semana: string,
    pais?: Country
  ): Promise<KitchenAvailabilityOutput> {
    try {
      const data = await this.getFromSupabase(semana, pais);

      // Calcular promedios
      const promedio_general =
        data.length > 0
          ? Math.round(
              (data.reduce((sum, d) => sum + d.disponibilidad_pct, 0) / data.length) * 10
            ) / 10
          : 0;

      const alwaysOn = data.filter((d) => d.catering_level === "A" || d.catering_level === "B");
      const promedio_always_on =
        alwaysOn.length > 0
          ? Math.round(
              (alwaysOn.reduce((sum, d) => sum + d.disponibilidad_pct, 0) / alwaysOn.length) * 10
            ) / 10
          : 0;

      return {
        semana,
        pais,
        data,
        promedio_general,
        promedio_always_on,
        alertas: data.filter((d) => d.disponibilidad_pct === 0).length > 0
          ? [
              `⚠️ ${data.filter((d) => d.disponibilidad_pct === 0).length} cocina(s) con 0% (recién abierta o inactiva)`,
            ]
          : [],
      };
    } catch (error) {
      console.error(`[KitchenAvailabilityAdapter] Error:`, error);
      return {
        semana,
        pais,
        data: [],
        promedio_general: 0,
        promedio_always_on: 0,
        alertas: [`Error: ${error instanceof Error ? error.message : "desconocido"}`],
      };
    }
  }

  private async getFromSupabase(
    semana: string,
    pais?: Country
  ): Promise<KitchenAvailabilityData[]> {
    try {
      // Convertir W24-2026 a 242026 para el lake
      const [weekPart, yearPart] = semana.split("-");
      const weekNum = weekPart.substring(1);
      const semana_id = `${weekNum}${yearPart}`;

      // Si hay filtro país, necesitamos filtrar por ciudad
      let cityFilter = "";
      if (pais === "PE") {
        cityFilter = "&city=in.(Lima,Piura)";
      } else if (pais === "CO") {
        cityFilter = "&city=eq.Bogotá";
      } else if (pais === "MX") {
        cityFilter = "&city=in.(CDMX,Monterrey,Guadalajara)";
      }

      const response = await fetch(
        `${SUPABASE_URL}/carta_availability?semana_id=eq.${semana_id}${cityFilter}&order=disponibilidad_pct.desc&limit=200`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Supabase carta_availability: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data as KitchenAvailabilityData[];
    } catch (error) {
      console.warn(`[KitchenAvailabilityAdapter] Supabase Error:`, error);
      return [];
    }
  }
}
