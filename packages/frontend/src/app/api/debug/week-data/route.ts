import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const week = request.nextUrl.searchParams.get("week") || "W23-2026";
    const country = request.nextUrl.searchParams.get("country") || "PE";

    // Parsear W23-2026 -> semana 23, año 2026
    const [weekPart, yearPart] = week.split('-');
    const weekNum = parseInt(weekPart.substring(1), 10);
    const year = parseInt(yearPart, 10);

    // 1. Contar meals totales
    const mealsResponse = await fetch(
      `${SUPABASE_URL}/meals?select=count()&country=eq.${country}`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const mealsCount = mealsResponse.ok ? mealsResponse.headers.get('content-range') : 'error';

    // 2. Contar stores
    const storesResponse = await fetch(
      `${SUPABASE_URL}/stores?select=count()&country=eq.${country}`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const storesCount = storesResponse.ok ? storesResponse.headers.get('content-range') : 'error';

    // 3. Ver órdenes de la semana (primeras 5)
    const ordersResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=*&country=eq.${country}&limit=5&order=order_date.desc`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const orders = ordersResponse.ok ? await ordersResponse.json() : [];

    // 4. Ver rango de fechas en meal_orders_daily
    const datesResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=order_date&order=order_date.desc&limit=1`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const lastOrderDate = datesResponse.ok ? (await datesResponse.json())[0] : null;

    // 5. Verificar rango de fechas en meal_orders_daily
    const dateRangeResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=order_date&order=order_date.asc&limit=1`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const dateRangeData = dateRangeResponse.ok ? await dateRangeResponse.json() : [];
    const minDate = dateRangeData.length > 0 ? dateRangeData[0].order_date : null;

    const dateRangeMaxResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=order_date&order=order_date.desc&limit=1`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const dateRangeMaxData = dateRangeMaxResponse.ok ? await dateRangeMaxResponse.json() : [];
    const maxDate = dateRangeMaxData.length > 0 ? dateRangeMaxData[0].order_date : null;

    // 6. Foodcost calculation test
    const foodcostResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=costo_teorico_local,precio_local&country=eq.${country}&limit=100`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const foodcostData = foodcostResponse.ok ? await foodcostResponse.json() : [];

    let totalCosto = 0;
    let totalPrecio = 0;
    foodcostData.forEach((row: any) => {
      totalCosto += row.costo_teorico_local || 0;
      totalPrecio += row.precio_local || 0;
    });
    const foodcostPct = totalPrecio > 0 ? (totalCosto / totalPrecio) * 100 : 0;

    return NextResponse.json({
      success: true,
      week: { number: weekNum, year, formatted: week },
      country,
      data: {
        meals_count: mealsCount,
        stores_count: storesCount,
        date_range: {
          min: minDate,
          max: maxDate,
          note: "meal_orders_daily contiene datos desde min hasta max"
        },
        last_order_date: lastOrderDate?.order_date,
        orders_sample: orders.slice(0, 3),
        foodcost: {
          total_costo: totalCosto,
          total_precio: totalPrecio,
          calculated_pct: Math.round(foodcostPct * 100) / 100,
          sample_size: foodcostData.length,
        },
      },
    });
  } catch (error) {
    console.error("[/api/debug/week-data]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
