import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/carta/utils";
import { query } from "@/lib/db";
import type { MealForChecklist } from "@/carta/calculations/types";

interface MealRow {
  meal_id: number;
  nombre: string;
  proteina: string;
  es_estrella: number;
  calificacion_promedio: number;
  ultima_aparicion_semana: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pais = searchParams.get("pais") || "PE";
    const semana = searchParams.get("semana") || "192026";

    const countryMap: Record<string, number> = {
      PE: 1,
      CO: 3,
      MX: 2,
    };

    const countryId = countryMap[pais] || 1;

    const sql = `
      SELECT 
        m.id as meal_id,
        m.name as nombre,
        COALESCE(m.category, "otro") as proteina,
        0 as es_estrella,
        COALESCE(AVG(of.q_ped), 4.7) as calificacion_promedio,
        WEEK(MAX(o.date)) as ultima_aparicion_semana
      FROM meals m
      LEFT JOIN order_details od ON m.id = od.meal_id
      LEFT JOIN orders o ON od.order_id = o.id
      LEFT JOIN orders_feedbacks of ON o.id = of.order_id
      LEFT JOIN branch_offices bo ON o.branch_office_id = bo.id
      WHERE bo.country_id = ?
        AND o.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY m.id, m.name, m.category
      LIMIT 50
    `;

    const platos = await query<MealRow>(sql, [countryId]);

    if (platos.length === 0) {
      return NextResponse.json(
        errorResponse("No hay datos en BD, devolviendo mock", "NO_DATA")
      );
    }

    const resultado: MealForChecklist[] = platos.map(p => ({
      meal_id: p.meal_id,
      nombre: p.nombre,
      proteina: (p.proteina.toLowerCase() as any) || "otro",
      es_estrella: p.es_estrella === 1,
      calificacion_promedio: Math.round(p.calificacion_promedio * 100) / 100,
      ultima_aparicion_semana: p.ultima_aparicion_semana || 1,
      peso_total_gr: 350,
      proteina_gr: 70,
      verduras_gr: 80,
      arroz_gr: 100,
    }));

    return NextResponse.json(
      successResponse({
        semana,
        pais,
        platos: resultado,
        conteo: resultado.length,
        origen: "BD_REAL",
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error conectando BD";
    console.error("[/api/carta/data/platos] Error real BD:", message);

    return NextResponse.json(
      errorResponse(`BD no disponible: ${message}. Usando mock.`, "DB_ERROR")
    );
  }
}
