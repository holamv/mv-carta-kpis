import { describe, it, expect } from "vitest";
import { ReportConsolidator } from "../report.consolidator";
import type { ReportConsolidatorInput } from "../types";

describe("ReportConsolidator", () => {
  const consolidator = new ReportConsolidator();

  it("debe consolidar todos los reportes en un resumen ejecutivo", () => {
    const input: ReportConsolidatorInput = {
      semana: "202606",
      checklistOutput: [
        {
          pais: "PE",
          cumplimiento_pct: 80,
          alertas: [
            {
              regla: "calificacion",
              severidad: "error",
              mensaje: "Test alert",
            },
          ],
          detalle_reglas: {
            calificacion: { pasada: false, promedio: 4.6 },
            variedad: { pasada: true, carne: 2, cerdo: 2, pescado: 2, estrella: 4, maximo: 5 },
            rotacion: { pasada: true, obsoletos: [] },
            pollo: { pasada: true, frecuencia: 5, limite: 7 },
            pesos: { pasada: true, platos_con_problema: [] },
          },
        },
      ],
      availabilityOutput: {
        semana: "202606",
        datos_tiendas: [],
        porcentaje_promedio_general: 75,
        porcentaje_promedio_por_pais: { PE: 75, CO: 0, MX: 0 },
        alertas: [],
      },
      foodcostOutput: {
        semana_actual: "202606",
        semana_anterior: "202605",
        comparativos: [],
        alertas: [],
      },
      nuevosPlatos: {
        semana: "202606",
        pais_filtro: undefined,
        platos: [],
        conteo_total: 3,
      },
    };

    const resultado = consolidator.consolidate(input);

    expect(resultado.checklist_cumplimiento_general).toBe(80);
    expect(resultado.checklist_alertas_criticas).toBe(1);
    expect(resultado.availability_promedio).toBe(75);
    expect(resultado.nuevos_platos_count).toBe(3);
    expect(resultado.resumen_ejecutivo).toContain("80%");
  });

  it("debe clasificar status en BUENO si cumpl >= 80%", () => {
    const input: ReportConsolidatorInput = {
      semana: "202606",
      checklistOutput: [
        {
          pais: "PE",
          cumplimiento_pct: 85,
          alertas: [],
          detalle_reglas: {
            calificacion: { pasada: true, promedio: 4.8 },
            variedad: { pasada: true, carne: 2, cerdo: 2, pescado: 2, estrella: 4, maximo: 5 },
            rotacion: { pasada: true, obsoletos: [] },
            pollo: { pasada: true, frecuencia: 5, limite: 7 },
            pesos: { pasada: true, platos_con_problema: [] },
          },
        },
      ],
      availabilityOutput: {
        semana: "202606",
        datos_tiendas: [],
        porcentaje_promedio_general: 80,
        porcentaje_promedio_por_pais: { PE: 80, CO: 0, MX: 0 },
        alertas: [],
      },
      foodcostOutput: {
        semana_actual: "202606",
        semana_anterior: "202605",
        comparativos: [],
        alertas: [],
      },
      nuevosPlatos: {
        semana: "202606",
        platos: [],
        conteo_total: 0,
      },
    };

    const resultado = consolidator.consolidate(input);

    expect(resultado.resumen_ejecutivo).toContain("[BUENO]");
  });
});
