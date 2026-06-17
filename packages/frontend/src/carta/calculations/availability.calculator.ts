import type { AvailabilityInput, AvailabilityOutput } from "./types";
import { UMBRALES } from "../config";

export class AvailabilityCalculator {
  calculate(input: AvailabilityInput): AvailabilityOutput {
    const alertas: string[] = [];
    const paises = new Set<string>();

    const datos_tiendas = input.tiendas.map(t => {
      paises.add(t.pais);
      const porcentaje = Math.round((t.platos_activos / t.platos_total) * 100);

      if (porcentaje < UMBRALES.DISPONIBILIDAD_ALERTA) {
        alertas.push(`${t.tienda_nombre} (${t.ciudad}): ${porcentaje}% disponibilidad`);
      }

      return {
        tienda_id: t.tienda_id,
        tienda_nombre: t.tienda_nombre,
        ciudad: t.ciudad,
        porcentaje,
        platos_activos: t.platos_activos,
        platos_total: t.platos_total,
      };
    });

    const porcentaje_promedio_general = Math.round(
      (input.tiendas.reduce((sum, t) => sum + t.platos_activos, 0) /
        input.tiendas.reduce((sum, t) => sum + t.platos_total, 0)) *
        100
    );

    const porcentaje_promedio_por_pais: Record<string, number> = {};
    for (const pais of paises) {
      const tiendas_pais = input.tiendas.filter(t => t.pais === pais);
      const promedio = Math.round(
        (tiendas_pais.reduce((sum, t) => sum + t.platos_activos, 0) /
          tiendas_pais.reduce((sum, t) => sum + t.platos_total, 0)) *
          100
      );
      porcentaje_promedio_por_pais[pais] = promedio;
    }

    return {
      semana: input.semana,
      pais_filtro: input.pais,
      datos_tiendas,
      porcentaje_promedio_general,
      porcentaje_promedio_por_pais: porcentaje_promedio_por_pais as any,
      alertas,
    };
  }
}
