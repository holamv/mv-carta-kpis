import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const type = request.nextUrl.searchParams.get("type") || "rules_by_city"; // rules_by_city, failing_meals
    const semanaId = request.nextUrl.searchParams.get("semana_id") || "252026";
    const branchOfficeId = request.nextUrl.searchParams.get("branch_office_id");

    if (type === "rules_by_city") {
      // Detalle de qué falla por ciudad
      // SELECT city, rules->'variedad_carne'->>'detail' AS carne, ...
      // FROM carta_compliance WHERE semana_id='252026';

      const response = await fetch(
        `${SUPABASE_URL}/carta_compliance?semana_id=eq.${semanaId}&select=city,compliance_pct,rules&order=compliance_pct.desc&limit=100`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return NextResponse.json({ success: false, data: [] }, { status: 500 });

      const compliance = await response.json();

      const data = compliance.map((row: any) => {
        const rules = typeof row.rules === "string" ? JSON.parse(row.rules) : row.rules || {};
        return {
          city: row.city,
          compliance_pct: row.compliance_pct,
          rules_detail: {
            variedad_carne: rules.variedad_carne?.detail || "N/A",
            variedad_cerdo: rules.variedad_cerdo?.detail || "N/A",
            variedad_pescado: rules.variedad_pescado?.detail || "N/A",
            estrella_en_carta: rules.estrella_en_carta?.detail || "N/A",
            ensalada_share_20: rules.ensalada_share_20?.detail || "N/A",
            snack_share_30: rules.snack_share_30?.detail || "N/A",
            pollo_ensalada_max: rules.pollo_ensalada_max?.detail || "N/A",
          },
        };
      });

      return NextResponse.json({ success: true, type: "rules_by_city", semana_id: semanaId, data });
    } else if (type === "failing_meals") {
      // Platos que fallan una regla puntual (ej. foodcost)
      // SELECT meal_name, checks FROM carta_compliance_meals
      // WHERE branch_office_id=2 AND checks->>'foodcost_lt40'='false';

      if (!branchOfficeId) {
        return NextResponse.json(
          { success: false, error: "branch_office_id required" },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${SUPABASE_URL}/carta_compliance_meals?semana_id=eq.${semanaId}&branch_office_id=eq.${branchOfficeId}&select=meal_name,is_star,checks&limit=200`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return NextResponse.json({ success: false, data: [] }, { status: 500 });

      const meals = await response.json();

      const data = meals.map((row: any) => {
        const checks = typeof row.checks === "string" ? JSON.parse(row.checks) : row.checks || {};
        // Extract failing rules
        const failing: string[] = [];
        Object.entries(checks).forEach(([rule, value]) => {
          if (value === false) failing.push(rule);
        });

        return {
          meal_name: row.meal_name,
          is_star: row.is_star,
          failing_rules: failing,
          checks_detail: checks,
        };
      });

      return NextResponse.json({
        success: true,
        type: "failing_meals",
        semana_id: semanaId,
        branch_office_id: branchOfficeId,
        data,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[/api/carta/data/compliance-details]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
