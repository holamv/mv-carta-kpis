import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar tablas disponibles
    const tables = await query<{ TABLE_NAME: string }>(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?"
      , ["manzanaverdedb"]
    );

    // Verificar estructura de meals
    const mealColumns = await query<{ COLUMN_NAME: string; DATA_TYPE: string }>(
      "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?",
      ["meals", "manzanaverdedb"]
    );

    // Contar registros en meals
    const mealCount = await query<{ total: number }>(
      "SELECT COUNT(*) as total FROM meals"
    );

    // Sample de meals
    const mealSample = await query(
      "SELECT * FROM meals LIMIT 5"
    );

    return NextResponse.json({
      success: true,
      data: {
        tablas: tables,
        mealColumns: mealColumns,
        mealCount: mealCount,
        mealSample: mealSample,
      },
    });
  } catch (error) {
    console.error("[/api/debug]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
