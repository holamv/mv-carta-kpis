import { NextRequest, NextResponse } from "next/server";
import { weekStringToDateRange } from "@/carta/adapters/utils";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

const COUNTRY_ID_MAP = { PE: 1, MX: 2, CO: 3 };

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const semana = request.nextUrl.searchParams.get("semana") || "W24-2026";
    const pais = request.nextUrl.searchParams.get("pais") || "PE";
    const ciudad = request.nextUrl.searchParams.get("ciudad");

    const { start, end } = weekStringToDateRange(semana);
    const countryId = (COUNTRY_ID_MAP as any)[pais];

    console.log(`\n🔍 Validating filters: semana=${semana} (${start} to ${end}), pais=${pais} (id=${countryId}), ciudad=${ciudad}`);

    // 1. Verificar meals disponibles por semana/país
    const mealsResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=meal_id,store_id&country_id=eq.${countryId}&order_date=gte.${start}&order_date=lte.${end}&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const orders = mealsResponse.ok ? await mealsResponse.json() : [];
    const uniqueMeals = new Set(orders.map((o: any) => o.meal_id)).size;
    const uniqueStores = new Set(orders.map((o: any) => o.store_id)).size;

    console.log(`  meals in week: ${uniqueMeals} unique, ${orders.length} total orders`);
    console.log(`  stores in week: ${uniqueStores} unique`);

    // 2. Disponibilidad por tienda (debería variar)
    const storesResponse = await fetch(
      `${SUPABASE_URL}/stores?select=store_id,store_name,city&country_id=eq.${countryId}&limit=100`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const stores = storesResponse.ok ? await storesResponse.json() : [];

    const availabilityByStore: Record<string, { name: string; city: string; count: number }> = {};
    orders.forEach((order: any) => {
      if (!availabilityByStore[order.store_id]) {
        const store = stores.find((s: any) => s.store_id === order.store_id);
        availabilityByStore[order.store_id] = {
          name: store?.store_name || `Store ${order.store_id}`,
          city: store?.city || "Unknown",
          count: 0,
        };
      }
      availabilityByStore[order.store_id].count++;
    });

    console.log(`\n📊 Disponibilidad por tienda (${semana} ${pais}):`);
    Object.entries(availabilityByStore).forEach(([storeId, data]) => {
      console.log(`  ${data.city} - ${data.name}: ${data.count} platos`);
    });

    // 3. Filtrar por ciudad si se proporciona
    let availabilityByCity: Record<string, number> = {};
    if (ciudad) {
      availabilityByCity = Object.entries(availabilityByStore)
        .filter(([, data]) => data.city.toLowerCase() === ciudad.toLowerCase())
        .reduce((acc, [, data]) => {
          acc[data.name] = data.count;
          return acc;
        }, {} as Record<string, number>);

      console.log(`\n📍 Disponibilidad en ${ciudad}:`);
      Object.entries(availabilityByCity).forEach(([store, count]) => {
        console.log(`  ${store}: ${count} platos`);
      });
    }

    // 4. Verificar TOP MEALS por país
    const topMealsResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=meal_id,unidades&country_id=eq.${countryId}&order_date=gte.${start}&order_date=lte.${end}&order=unidades.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const topOrders = topMealsResponse.ok ? await topMealsResponse.json() : [];

    const topMealIds = topOrders.map((o: any) => o.meal_id).join(",");
    const topMealsDetailsResponse = await fetch(
      `${SUPABASE_URL}/meals?select=meal_id,meal_name&meal_id=in.(${topMealIds})&limit=10`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const topMealsDetails = topMealsDetailsResponse.ok ? await topMealsDetailsResponse.json() : [];

    console.log(`\n🍽️ Top 5 meals (${semana} ${pais}):`);
    topOrders.slice(0, 5).forEach((order: any, i: number) => {
      const meal = topMealsDetails.find((m: any) => m.meal_id === order.meal_id);
      console.log(`  ${i + 1}. ${meal?.meal_name || `Meal ${order.meal_id}`}: ${order.unidades} unidades`);
    });

    // 5. Comparar con otra semana
    const [prevWeekPart, prevYearPart] = semana.split("-");
    const prevWeek = parseInt(prevWeekPart.substring(1)) - 1;
    const prevSemana = `W${prevWeek.toString().padStart(2, "0")}-${prevYearPart}`;
    const { start: prevStart, end: prevEnd } = weekStringToDateRange(prevSemana);

    const prevOrdersResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=meal_id&country_id=eq.${countryId}&order_date=gte.${prevStart}&order_date=lte.${prevEnd}&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const prevOrders = prevOrdersResponse.ok ? await prevOrdersResponse.json() : [];
    const prevUniqueMeals = new Set(prevOrders.map((o: any) => o.meal_id)).size;

    console.log(`\n📈 Comparación de semanas (${pais}):`);
    console.log(`  ${semana}: ${uniqueMeals} meals`);
    console.log(`  ${prevSemana}: ${prevUniqueMeals} meals`);
    console.log(`  Diferencia: ${uniqueMeals - prevUniqueMeals} meals`);

    return NextResponse.json({
      success: true,
      filters: { semana, pais, ciudad, dateRange: { start, end }, countryId },
      data: {
        meals_in_week: { unique: uniqueMeals, total_orders: orders.length },
        stores_in_week: uniqueStores,
        availability_by_store: availabilityByStore,
        availability_by_city: availabilityByCity,
        top_meals: topOrders
          .slice(0, 5)
          .map((order: any, i: number) => {
            const meal = topMealsDetails.find((m: any) => m.meal_id === order.meal_id);
            return { rank: i + 1, name: meal?.meal_name, unidades: order.unidades };
          }),
        week_comparison: {
          current_week: semana,
          current_meals: uniqueMeals,
          previous_week: prevSemana,
          previous_meals: prevUniqueMeals,
          difference: uniqueMeals - prevUniqueMeals,
        },
      },
    });
  } catch (error) {
    console.error("[/api/debug/filters-validation]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
