import { NextRequest, NextResponse } from "next/server";
import { KitchenAvailabilityAdapter } from "@/carta/adapters/kitchen-availability.adapter";
import type { Country } from "@/carta/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semana = request.nextUrl.searchParams.get("semana") || "W24-2026";
    const pais = (request.nextUrl.searchParams.get("pais") || undefined) as Country | undefined;

    const adapter = new KitchenAvailabilityAdapter();
    const result = await adapter.getKitchenAvailabilityForWeek(semana, pais);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/carta/kitchen-availability]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
