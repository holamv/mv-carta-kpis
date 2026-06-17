import { describe, it, expect } from "vitest";
import { NuevosPlatosAnalyzer } from "../nuevos-platos.analyzer";
import type { NuevosPlatosInput } from "../types";

describe("NuevosPlatosAnalyzer", () => {
  const analyzer = new NuevosPlatosAnalyzer();

  it("debe filtrar platos lanzados en ultimos 7 dias", () => {
    const ahora = new Date();
    const hace_3_dias = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const hace_10_dias = new Date(ahora.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

    const input: NuevosPlatosInput = {
      semana: "202606",
      platos: [
        {
          meal_id: 1,
          nombre: "Plato Reciente",
          categoria: "Carne",
          pais: "PE",
          fecha_lanzamiento: hace_3_dias,
          ventas_unidades: 100,
          foodcost_pct: 35,
          calificacion_promedio: 4.7,
        },
        {
          meal_id: 2,
          nombre: "Plato Viejo",
          categoria: "Pollo",
          pais: "PE",
          fecha_lanzamiento: hace_10_dias,
          ventas_unidades: 50,
          foodcost_pct: 30,
          calificacion_promedio: 4.5,
        },
      ],
    };

    const resultado = analyzer.analyze(input);

    expect(resultado.platos.length).toBe(1);
    expect(resultado.platos[0].nombre).toBe("Plato Reciente");
  });

  it("debe clasificar performance segun calificacion", () => {
    const ahora = new Date();
    const hace_3_dias = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const input: NuevosPlatosInput = {
      semana: "202606",
      platos: [
        {
          meal_id: 1,
          nombre: "Top Plato",
          categoria: "Carne",
          pais: "PE",
          fecha_lanzamiento: hace_3_dias,
          ventas_unidades: 150,
          foodcost_pct: 35,
          calificacion_promedio: 4.8,
        },
      ],
    };

    const resultado = analyzer.analyze(input);

    expect(resultado.platos[0].performance).toBe("arriba_promedio");
  });
});
