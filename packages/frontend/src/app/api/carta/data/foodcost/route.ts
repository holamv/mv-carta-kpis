import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/carta/utils";
import { getPreviousWeek } from "@/carta/utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semana = request.nextUrl.searchParams.get("semana") || "W24-2026";
    const semanaprev = getPreviousWeek(semana);

    return NextResponse.json(successResponse({
      data: {
        semana_actual: semana,
        semana_anterior: semanaprev,
        datos_semana_actual: { PE: 35, CO: 36, MX: 32 },
        datos_semana_anterior: { PE: 33, CO: 34, MX: 30 },
      },
    }));
  } catch (error) {
    console.error("[/api/carta/data/foodcost]", error);
    return NextResponse.json(
      errorResponse("Error procesando foodcost", "DATA_ERROR"),
      { status: 500 }
    );
  }
}
