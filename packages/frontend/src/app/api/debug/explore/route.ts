import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(): Promise<NextResponse> {
  try {
    // Ver estructura real de meal_orders_daily (primeros 3 registros)
    const ordersResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?limit=3`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const orders = ordersResponse.ok ? await ordersResponse.json() : [];

    // Ver estructura de meals
    const mealsResponse = await fetch(
      `${SUPABASE_URL}/meals?limit=2`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const meals = mealsResponse.ok ? await mealsResponse.json() : [];

    // Ver estructura de stores
    const storesResponse = await fetch(
      `${SUPABASE_URL}/stores?limit=2`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const stores = storesResponse.ok ? await storesResponse.json() : [];

    // Contar total de registros sin filtro
    const ordersCountResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=count()`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const ordersCountHeader = ordersCountResponse.ok ? ordersCountResponse.headers.get('content-range') : 'error';

    return NextResponse.json({
      success: true,
      structures: {
        meal_orders_daily_sample: orders.length > 0 ? orders[0] : "NO DATA",
        meal_orders_daily_keys: orders.length > 0 ? Object.keys(orders[0]) : [],
        meals_sample: meals.length > 0 ? meals[0] : "NO DATA",
        meals_keys: meals.length > 0 ? Object.keys(meals[0]) : [],
        stores_sample: stores.length > 0 ? stores[0] : "NO DATA",
        stores_keys: stores.length > 0 ? Object.keys(stores[0]) : [],
      },
      counts: {
        meal_orders_daily_total: ordersCountHeader,
        meal_orders_daily_returned: orders.length,
        meals_returned: meals.length,
        stores_returned: stores.length,
      },
    });
  } catch (error) {
    console.error("[/api/debug/explore]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
