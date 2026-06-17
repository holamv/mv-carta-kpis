import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semanaId = request.nextUrl.searchParams.get("semana_id") || "252026";

    // Query: Disponibilidad por cocina (solo Level A+B)
    // SELECT city, catering_name, disponibilidad_pct, disponibles, carta_total
    // FROM carta_availability
    // WHERE semana_id='242026' AND catering_level IN ('A','B')
    // ORDER BY disponibilidad_pct DESC;

    const response = await fetch(
      `${SUPABASE_URL}/carta_availability?semana_id=eq.${semanaId}&catering_level=in.(A,B)&select=city,catering_name,catering_level,disponibilidad_pct,disponibles,carta_total&order=disponibilidad_pct.desc&limit=100`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.map((row: any) => ({
        city: row.city,
        catering_name: row.catering_name,
        level: row.catering_level,
        disponibilidad_pct: row.disponibilidad_pct,
        disponibles: row.disponibles,
        carta_total: row.carta_total,
      })),
    });
  } catch (error) {
    console.error("[/api/carta/data/availability-by-kitchen]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
