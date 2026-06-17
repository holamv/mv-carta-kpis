import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semanaId = request.nextUrl.searchParams.get("semana_id") || "252026";

    // Query: Cumplimiento de carta por ciudad
    // SELECT city, compliance_pct, rules
    // FROM carta_compliance
    // WHERE semana_id='252026'
    // ORDER BY compliance_pct DESC;

    const response = await fetch(
      `${SUPABASE_URL}/carta_compliance?semana_id=eq.${semanaId}&select=city,compliance_pct,rules&order=compliance_pct.desc&limit=100`,
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

    const compliance = await response.json();

    // Extraer métricas de rules JSONB
    const data = compliance.map((row: any) => {
      const rules = typeof row.rules === "string" ? JSON.parse(row.rules) : row.rules || {};
      return {
        city: row.city,
        compliance_pct: row.compliance_pct,
        variedad_carne: rules.variedad_carne || false,
        variedad_cerdo: rules.variedad_cerdo || false,
        variedad_pescado: rules.variedad_pescado || false,
        estrella_en_carta: rules.estrella_en_carta || false,
        ensalada_share: rules.ensalada_share_20 || false,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/carta/data/compliance-by-city]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
