import { NextRequest, NextResponse } from "next/server";
import { buildSemanaId, parseSemana } from "@/carta/config";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

/**
 * Dashboard maestro según guía Leo
 * Flujo: semana (W25-2026) → país (PE) → ciudad (Lima) → branch_office_id (2)
 *
 * GET /api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima
 *
 * Retorna 5 paneles:
 * 1. Foodcost de la ciudad
 * 2. Checklist compliance %
 * 3. Top 5 platos
 * 4. Disponibilidad cocinas (A+B)
 * 5. Detalle checklist (reglas)
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semana = request.nextUrl.searchParams.get("semana") || "W25-2026";
    const pais = request.nextUrl.searchParams.get("pais") || "PE";
    const ciudad = request.nextUrl.searchParams.get("ciudad") || "Lima";

    // Parsear semana → buildSemanaId SIN CEROS (Leo rule)
    const { week, year } = parseSemana(semana);
    const semanaId = buildSemanaId(week, year); // "252026" no "0252026"

    // Importar mapping solo aquí para evitar circular deps
    const { CITY_MAPPING } = await import("@/carta/config");

    // Obtener branch_office_id del mapping
    const boId = CITY_MAPPING[pais as keyof typeof CITY_MAPPING]?.[ciudad];
    if (!boId) {
      return NextResponse.json(
        { success: false, error: `Invalid city ${ciudad} for country ${pais}` },
        { status: 400 }
      );
    }

    console.log(`🎯 Dashboard Leo: semana=${semana} (${semanaId}), pais=${pais}, ciudad=${ciudad}, bo=${boId}`);

    // Panel 1: Foodcost (desde vista v_carta_foodcost)
    const foodcostRes = await fetch(
      `${SUPABASE_URL}/v_carta_foodcost?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const foodcost = foodcostRes.ok ? await foodcostRes.json() : [];

    // Panel 2: Compliance %
    const complianceRes = await fetch(
      `${SUPABASE_URL}/carta_compliance?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}&select=compliance_pct,meals_count,rules`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const compliance = complianceRes.ok ? await complianceRes.json() : [];

    // Panel 3: Top 5 platos (desde vista v_carta_top_platos)
    const topMealsRes = await fetch(
      `${SUPABASE_URL}/v_carta_top_platos?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}&order=unidades.desc&limit=5`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const topMeals = topMealsRes.ok ? await topMealsRes.json() : [];

    // Panel 4: Disponibilidad cocinas (usa semana anterior si actual está vacía)
    let availabilityRes = await fetch(
      `${SUPABASE_URL}/carta_availability?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}&order=disponibilidad_pct.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    let availability = availabilityRes.ok ? await availabilityRes.json() : [];

    // Si vacío, usar semana anterior (Leo: disponibilidad va 1 semana atrasada)
    if (availability.length === 0 && week > 1) {
      const prevSemanaId = buildSemanaId(week - 1, year);
      availabilityRes = await fetch(
        `${SUPABASE_URL}/carta_availability?semana_id=eq.${prevSemanaId}&branch_office_id=eq.${boId}&order=disponibilidad_pct.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      availability = availabilityRes.ok ? await availabilityRes.json() : [];
    }

    // Panel 5: Detalle checklist (reglas por ciudad + reglas por plato)
    const complianceDetailRes = await fetch(
      `${SUPABASE_URL}/carta_compliance_meals?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}&select=meal_name,is_star,passed,applicable,checks&order=passed.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const complianceDetail = complianceDetailRes.ok ? await complianceDetailRes.json() : [];

    // Bonus: Star plates
    const starPlatesRes = await fetch(
      `${SUPABASE_URL}/star_plates_weekly?semana_id=eq.${semanaId}&branch_office_id=eq.${boId}&order=rank.asc&limit=5`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const starPlates = starPlatesRes.ok ? await starPlatesRes.json() : [];

    return NextResponse.json({
      success: true,
      filters: { semana, pais, ciudad, semanaId, boId },
      panels: {
        foodcost: foodcost.length > 0 ? foodcost[0] : null,
        compliance: compliance.length > 0 ? compliance[0] : null,
        topMeals: topMeals.map((m: any) => ({
          meal_name: m.meal_name,
          unidades: Number(m.unidades),
          rating: m.rating,
          food_cost_pct: Number(m.food_cost_pct),
          is_star: m.is_star,
        })),
        availability: availability.map((a: any) => ({
          catering_name: a.catering_name,
          catering_level: a.catering_level,
          disponibles: Number(a.disponibles),
          carta_total: Number(a.carta_total),
          disponibilidad_pct: Number(a.disponibilidad_pct),
        })),
        complianceDetail: complianceDetail.map((m: any) => ({
          meal_name: m.meal_name,
          is_star: m.is_star,
          passed: Number(m.passed),
          applicable: Number(m.applicable),
          compliance_ratio: m.applicable > 0 ? (m.passed / m.applicable * 100).toFixed(1) : 0,
          checks: typeof m.checks === "string" ? JSON.parse(m.checks) : m.checks,
        })),
        starPlates: starPlates.map((sp: any) => ({
          rank: Number(sp.rank),
          meal_name: sp.meal_name,
          unidades_prev: Number(sp.unidades_prev),
          weeks_consecutive: Number(sp.weeks_consecutive),
        })),
      },
    });
  } catch (error) {
    console.error("[/api/carta/dashboard/leo]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
