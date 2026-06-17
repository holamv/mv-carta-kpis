import type { FoodcostInput, FoodcostOutput } from "./types";
import { UMBRALES } from "../config";
import type { Country } from "../types";

export class FoodcostCalculator {
  calculate(input: FoodcostInput): FoodcostOutput {
    const comparativos = [];
    const alertas: string[] = [];

    const paises: Country[] = ["PE", "CO", "MX"];

    for (const pais of paises) {
      const actual = input.datos_semana_actual[pais] || 0;
      const anterior = input.datos_semana_anterior[pais] || 0;

      const diferencia_pct = anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : 0;
      const alerta = Math.abs(diferencia_pct) > UMBRALES.FOODCOST_ALERTA_PCT;

      comparativos.push({
        pais,
        foodcost_actual: actual,
        foodcost_anterior: anterior,
        diferencia_pct,
        alerta,
      });

      if (alerta) {
        alertas.push(`${pais}: foodcost cambio ${diferencia_pct > 0 ? "+" : ""}${diferencia_pct}%`);
      }
    }

    return {
      semana_actual: input.semana_actual,
      semana_anterior: input.semana_anterior,
      comparativos,
      alertas,
    };
  }
}
