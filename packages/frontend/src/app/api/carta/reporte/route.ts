import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse, getCurrentWeek, getPreviousWeek } from "@/carta/utils";
import { ChecklistAdapter } from "@/carta/adapters/checklist.adapter";
import { AvailabilityAdapter } from "@/carta/adapters/availability.adapter";
import { FoodcostAdapter } from "@/carta/adapters/foodcost.adapter";
import { ReportConsolidator } from "@/carta/calculations/report.consolidator";
import type { CartaKPIReport, ApiResponse, Country, AvailabilityReport, FoodcostReport, ChecklistResultado } from "@/carta/types";
import type { AvailabilityOutput, FoodcostOutput, ChecklistOutput } from "@/carta/calculations/types";

function mapAvailabilityOutputToReport(output: AvailabilityOutput): AvailabilityReport {
  return {
    semana: output.semana,
    datos_tiendas: output.datos_tiendas.map(t => ({
      tienda_id: t.tienda_id,
      tienda_nombre: t.tienda_nombre,
      ciudad: t.ciudad,
      pais: 'PE', // Placeholder - sería obtenido del contexto
      platos_activos: t.platos_activos,
      platos_totales: t.platos_total,
      porcentaje_disponibilidad: t.porcentaje,
      platos_apagados: [],
    })),
    porcentaje_promedio_pais: output.porcentaje_promedio_por_pais,
    alertas: output.alertas,
  };
}

function mapFoodcostOutputToReport(output: FoodcostOutput): FoodcostReport {
  return {
    semana: output.semana_actual,
    datos_por_pais: output.comparativos.map(c => ({
      pais: c.pais,
      semana_actual: Math.round(c.foodcost_actual * 100) / 100,
      semana_anterior: Math.round(c.foodcost_anterior * 100) / 100,
      diferencia_pct: c.diferencia_pct,
      alerta: c.alerta,
    })),
    alertas: output.alertas,
  };
}

function mapChecklistOutputToResultado(output: ChecklistOutput): ChecklistResultado {
  return {
    pais: output.pais,
    cumplimiento_pct: output.cumplimiento_pct,
    alertas: output.alertas,
    metricas: {
      calificacion_promedio: output.detalle_reglas.calificacion.promedio,
      platos_bajo_465: output.detalle_reglas.calificacion.peor_plato ? [output.detalle_reglas.calificacion.peor_plato] : [],
      variedad_carne: output.detalle_reglas.variedad.carne.actual,
      variedad_cerdo: output.detalle_reglas.variedad.cerdo.actual,
      variedad_pescado: output.detalle_reglas.variedad.pescado.actual,
      variedad_estrella: output.detalle_reglas.variedad.estrella.actual,
      pollo_frecuencia: output.detalle_reglas.pollo.frecuencia,
      rotacion_obsoletos: output.detalle_reglas.rotacion.obsoletos,
    },
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<CartaKPIReport>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const semana = searchParams.get("semana") || getCurrentWeek();
    const pais = (searchParams.get("pais") as Country) || undefined;
    const ciudad = searchParams.get("ciudad") || undefined;

    const checklistAdapter = new ChecklistAdapter();
    const availabilityAdapter = new AvailabilityAdapter();
    const foodcostAdapter = new FoodcostAdapter();

    const paises: Country[] = pais ? [pais] : ["PE", "CO", "MX"];

    const [checklist, availability, foodcost] = await Promise.all([
      Promise.all(
        paises.map(p => checklistAdapter.getChecklistForWeek(p, semana))
      ),
      availabilityAdapter.getAvailabilityForWeek(semana, pais),
      foodcostAdapter.getFoodcostForWeek(semana),
    ]);

    const consolidator = new ReportConsolidator();
    const resumen = consolidator.consolidate({
      semana,
      pais_filtro: pais,
      ciudad_filtro: ciudad,
      checklistOutput: checklist,
      availabilityOutput: availability,
      foodcostOutput: foodcost,
      nuevosPlatos: {
        semana,
        pais_filtro: pais,
        platos: [],
        conteo_total: 0,
      },
    });

    const report: CartaKPIReport = {
      generado_en: new Date().toISOString(),
      semana,
      pais_filtro: pais,
      ciudad_filtro: ciudad,
      disponibilidad: mapAvailabilityOutputToReport(availability),
      foodcost: mapFoodcostOutputToReport(foodcost),
      platos_nuevos: {
        semana,
        platos: [],
      },
      checklist: {
        semana,
        resultados_por_pais: checklist.map(mapChecklistOutputToResultado),
        cumplimiento_promedio: resumen.checklist_cumplimiento_general,
      },
      mystery_orders: {
        semana,
        estado: "pendiente",
        mensaje: "Pendiente de integracion",
      },
    };

    return NextResponse.json(successResponse(report));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[/api/carta/reporte]", err);
    return NextResponse.json(
      errorResponse(message, "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}
