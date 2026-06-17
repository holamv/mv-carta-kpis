import type { NuevosPlatosInput, NuevosPlatosOutput } from "./types";

export class NuevosPlatosAnalyzer {
  analyze(input: NuevosPlatosInput): NuevosPlatosOutput {
    const ahora = new Date();
    const dias_minimo = input.dias_lanzamiento_minimo || 7;

    let platos_filtrados = input.platos.filter(p => {
      const fecha_lanzamiento = new Date(p.fecha_lanzamiento);
      const dias_desde_lanzamiento = Math.floor(
        (ahora.getTime() - fecha_lanzamiento.getTime()) / (1000 * 60 * 60 * 24)
      );
      return dias_desde_lanzamiento <= dias_minimo;
    });

    if (input.pais) {
      platos_filtrados = platos_filtrados.filter(p => p.pais === input.pais);
    }

    const platos = platos_filtrados.map(p => {
      const fecha_lanzamiento = new Date(p.fecha_lanzamiento);
      const dias_en_carta = Math.floor(
        (ahora.getTime() - fecha_lanzamiento.getTime()) / (1000 * 60 * 60 * 24)
      );

      const performance: 'arriba_promedio' | 'normal' | 'abajo_promedio' =
        p.calificacion_promedio >= 4.7
          ? "arriba_promedio"
          : p.calificacion_promedio >= 4.5
            ? "normal"
            : "abajo_promedio";

      return {
        meal_id: p.meal_id,
        nombre: p.nombre,
        categoria: p.categoria,
        pais: p.pais,
        dias_en_carta,
        ventas_unidades: p.ventas_unidades,
        foodcost_pct: p.foodcost_pct,
        calificacion_promedio: p.calificacion_promedio,
        performance,
      };
    });

    return {
      semana: input.semana,
      pais_filtro: input.pais,
      platos,
      conteo_total: platos.length,
    };
  }
}
