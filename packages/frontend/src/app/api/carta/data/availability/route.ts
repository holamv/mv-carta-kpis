import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/carta/utils";
import type { TiendaDispData } from "@/carta/calculations/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semana = request.nextUrl.searchParams.get("semana") || "W24-2026";
    const pais = request.nextUrl.searchParams.get("pais");

    const tiendas: TiendaDispData[] = [
      { tienda_id: 1, tienda_nombre: "Lima Centro", ciudad: "Lima", pais: "PE", cocina_id: 1, platos_activos: 75, platos_total: 100 },
      { tienda_id: 2, tienda_nombre: "Lima Sur", ciudad: "Lima", pais: "PE", cocina_id: 2, platos_activos: 80, platos_total: 100 },
      { tienda_id: 3, tienda_nombre: "Piura", ciudad: "Piura", pais: "PE", cocina_id: 5, platos_activos: 70, platos_total: 100 },
      { tienda_id: 10, tienda_nombre: "Bogota", ciudad: "Bogota", pais: "CO", cocina_id: 3, platos_activos: 70, platos_total: 100 },
      { tienda_id: 20, tienda_nombre: "CDMX", ciudad: "CDMX", pais: "MX", cocina_id: 4, platos_activos: 85, platos_total: 100 },
      { tienda_id: 21, tienda_nombre: "Monterrey", ciudad: "Monterrey", pais: "MX", cocina_id: 6, platos_activos: 75, platos_total: 100 },
      { tienda_id: 22, tienda_nombre: "Guadalajara", ciudad: "Guadalajara", pais: "MX", cocina_id: 7, platos_activos: 72, platos_total: 100 },
    ];

    const filtrados = pais ? tiendas.filter(t => t.pais === pais) : tiendas;

    return NextResponse.json(successResponse({
      semana,
      pais,
      data: {
        semana,
        pais,
        tiendas: filtrados,
      },
    }));
  } catch (error) {
    console.error("[/api/carta/data/availability]", error);
    return NextResponse.json(
      errorResponse("Error procesando disponibilidad", "DATA_ERROR"),
      { status: 500 }
    );
  }
}
