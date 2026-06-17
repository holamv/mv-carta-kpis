import { NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(): Promise<NextResponse> {
  try {
    // Query: Foodcost teórico por país
    // SELECT country_id,
    //   SUM(costo_teorico_local) total_costo,
    //   SUM(precio_local) total_precio,
    //   ROUND(100*SUM(costo_teorico_local)/NULLIF(SUM(precio_local),0),1) foodcost_pct
    // FROM meal_orders_daily
    // GROUP BY country_id;

    const response = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=country_id,costo_teorico_local,precio_local&limit=50000`,
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

    const orders = await response.json();

    // Aggregate by country
    const costByCountry: Record<
      number,
      { totalCosto: number; totalPrecio: number }
    > = {
      1: { totalCosto: 0, totalPrecio: 0 },
      2: { totalCosto: 0, totalPrecio: 0 },
      3: { totalCosto: 0, totalPrecio: 0 },
    };

    orders.forEach((order: any) => {
      const countryId = order.country_id;
      if (costByCountry[countryId]) {
        costByCountry[countryId].totalCosto += order.costo_teorico_local || 0;
        costByCountry[countryId].totalPrecio += order.precio_local || 0;
      }
    });

    const countryMap: Record<number, string> = { 1: "PE", 2: "MX", 3: "CO" };
    const currencyMap: Record<number, string> = {
      1: "S/",
      2: "$",
      3: "$",
    };

    const data = Object.entries(costByCountry).map(([countryId, { totalCosto, totalPrecio }]) => {
      const pct = totalPrecio > 0 ? (totalCosto / totalPrecio) * 100 : 0;
      const id = parseInt(countryId);
      return {
        country_code: countryMap[id],
        country_id: id,
        total_costo: Math.round(totalCosto),
        total_precio: Math.round(totalPrecio),
        foodcost_pct: Math.round(pct * 10) / 10,
        currency: currencyMap[id],
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/carta/data/foodcost-by-country]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
