import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const type = request.nextUrl.searchParams.get("type") || "by_country"; // by_country, by_plate, by_city

    if (type === "by_country") {
      // Foodcost por país desde meal_orders_daily
      // SELECT country_id, ROUND(100*SUM(costo_teorico_local)/NULLIF(SUM(precio_local),0),1) AS foodcost_pct
      // FROM meal_orders_daily GROUP BY country_id;

      const response = await fetch(
        `${SUPABASE_URL}/meal_orders_daily?select=country_id,costo_teorico_local,precio_local&limit=50000`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return NextResponse.json({ success: false, data: [] }, { status: 500 });

      const orders = await response.json();

      const costByCountry: Record<
        number,
        { totalCosto: number; totalPrecio: number }
      > = {
        1: { totalCosto: 0, totalPrecio: 0 },
        2: { totalCosto: 0, totalPrecio: 0 },
        3: { totalCosto: 0, totalPrecio: 0 },
      };

      orders.forEach((order: any) => {
        const id = order.country_id;
        if (costByCountry[id]) {
          costByCountry[id].totalCosto += order.costo_teorico_local || 0;
          costByCountry[id].totalPrecio += order.precio_local || 0;
        }
      });

      const countryMap: Record<number, string> = { 1: "PE", 2: "MX", 3: "CO" };
      const data = Object.entries(costByCountry).map(([id, { totalCosto, totalPrecio }]) => {
        const pct = totalPrecio > 0 ? (totalCosto / totalPrecio) * 100 : 0;
        return {
          country_id: parseInt(id),
          country: countryMap[parseInt(id)],
          total_costo: totalCosto,
          total_precio: totalPrecio,
          foodcost_pct: Math.round(pct * 10) / 10,
        };
      });

      return NextResponse.json({ success: true, type: "by_country", data });
    } else if (type === "by_plate") {
      // Foodcost por plato
      // SELECT meal_name, food_cost_pct, food_cost_local FROM meals WHERE food_cost_pct IS NOT NULL ORDER BY food_cost_pct DESC;

      const response = await fetch(
        `${SUPABASE_URL}/meals?select=meal_name,food_cost_pct,food_cost_local,country_id&food_cost_pct=not.is.null&order=food_cost_pct.desc&limit=100`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return NextResponse.json({ success: false, data: [] }, { status: 500 });

      const data = await response.json();

      return NextResponse.json({ success: true, type: "by_plate", data });
    } else if (type === "by_city") {
      // Foodcost por ciudad
      // SELECT s.city, ROUND(100*SUM(o.costo_teorico_local)/NULLIF(SUM(o.precio_local),0),1) foodcost_pct
      // FROM meal_orders_daily o JOIN stores s ON s.store_id=o.store_id GROUP BY s.city;

      const ordersResponse = await fetch(
        `${SUPABASE_URL}/meal_orders_daily?select=store_id,costo_teorico_local,precio_local&limit=50000`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!ordersResponse.ok)
        return NextResponse.json({ success: false, data: [] }, { status: 500 });

      const orders = await ordersResponse.json();

      const storesResponse = await fetch(
        `${SUPABASE_URL}/stores?select=store_id,city&limit=500`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const stores = storesResponse.ok ? await storesResponse.json() : [];
      const storeMap = new Map(stores.map((s: any) => [s.store_id, s.city]));

      const costByCity: Record<string, { totalCosto: number; totalPrecio: number }> = {};

      orders.forEach((order: any) => {
        const city = storeMap.get(order.store_id) || "Unknown";
        if (!costByCity[city]) {
          costByCity[city] = { totalCosto: 0, totalPrecio: 0 };
        }
        costByCity[city].totalCosto += order.costo_teorico_local || 0;
        costByCity[city].totalPrecio += order.precio_local || 0;
      });

      const data = Object.entries(costByCity).map(([city, { totalCosto, totalPrecio }]) => {
        const pct = totalPrecio > 0 ? (totalCosto / totalPrecio) * 100 : 0;
        return {
          city,
          total_costo: totalCosto,
          total_precio: totalPrecio,
          foodcost_pct: Math.round(pct * 10) / 10,
        };
      });

      return NextResponse.json({ success: true, type: "by_city", data });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[/api/carta/data/foodcost-details]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
