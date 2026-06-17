import type { ReportConsolidatorInput, ReportConsolidatorOutput } from "./types";

export class ReportConsolidator {
  consolidate(input: ReportConsolidatorInput): ReportConsolidatorOutput {
    const checklist_alertas_criticas = input.checklistOutput
      .reduce((sum, r) => sum + r.alertas.filter(a => a.severidad === "error").length, 0);

    const checklist_cumplimiento_general = Math.round(
      input.checklistOutput.reduce((sum, r) => sum + r.cumplimiento_pct, 0) / input.checklistOutput.length
    );

    const foodcost_alertas = input.foodcostOutput.alertas.length;

    const resumen_ejecutivo = this.buildResumen(
      checklist_cumplimiento_general,
      checklist_alertas_criticas,
      input.availabilityOutput.porcentaje_promedio_general,
      input.foodcostOutput.alertas.length,
      input.nuevosPlatos.conteo_total
    );

    return {
      generado_en: new Date().toISOString(),
      semana: input.semana,
      pais_filtro: input.pais_filtro,
      ciudad_filtro: input.ciudad_filtro,
      checklist_cumplimiento_general,
      checklist_alertas_criticas,
      availability_promedio: input.availabilityOutput.porcentaje_promedio_general,
      foodcost_alertas,
      nuevos_platos_count: input.nuevosPlatos.conteo_total,
      resumen_ejecutivo,
    };
  }

  private buildResumen(
    checklist_cumpl: number,
    checklist_alertas: number,
    availability: number,
    foodcost_alertas: number,
    nuevos_platos: number
  ): string {
    const status = checklist_cumpl >= 80 ? "BUENO" : checklist_cumpl >= 60 ? "ALERTA" : "CRITICO";

    return `[${status}] Cumplimiento carta ${checklist_cumpl}% (${checklist_alertas} alertas criticas). Disponibilidad ${availability}%. Foodcost: ${foodcost_alertas} alertas. ${nuevos_platos} platos nuevos lanzados.`;
  }
}
