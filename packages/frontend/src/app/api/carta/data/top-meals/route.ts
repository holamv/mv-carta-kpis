import { NextRequest, NextResponse } from "next/server";
import { weekStringToDateRange } from "@/carta/adapters/utils";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const country = request.nextUrl.searchParams.get("country") || "PE";
    const semana = request.nextUrl.searchParams.get("semana") || "W24-2026";

    // Mapeo country code a country_id
    const countryMap: Record<string, number> = { PE: 1, MX: 2, CO: 3 };
    const countryId = countryMap[country] || 1;

    // Obtener rango de fechas para la semana
    const { start, end } = weekStringToDateRange(semana);
    const dateFilter = `&order_date=gte.${start}&order_date=lte.${end}`;

    // Query: Top platos vendidos + rating + foodcost
    // SELECT meal_name, SUM(unidades) unidades, ROUND(AVG(rating),1) rating, food_cost_pct
    // FROM meal_orders_daily o
    // JOIN meals m ON m.meal_id=o.meal_id
    // LEFT JOIN meal_feedbacks f ON f.meal_id=o.meal_id
    // WHERE o.country_id=1
    // GROUP BY meal_name, food_cost_pct
    // ORDER BY unidades DESC LIMIT 10

    const response = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=meal_id,unidades&country_id=eq.${countryId}${dateFilter}&order=unidades.desc&limit=100`,
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

    // Obtener meals y feedbacks
    const mealsResponse = await fetch(
      `${SUPABASE_URL}/meals?select=meal_id,meal_name,food_cost_pct&country_id=eq.${countryId}&limit=2000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const meals = mealsResponse.ok ? await mealsResponse.json() : [];

    const feedbacksResponse = await fetch(
      `${SUPABASE_URL}/meal_feedbacks?select=meal_id,rating&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const feedbacks = feedbacksResponse.ok ? await feedbacksResponse.json() : [];

    // Aggregate data
    const mealStats: Record<
      string,
      {
        meal_name: string;
        unidades: number;
        ratings: number[];
        food_cost_pct: number;
      }
    > = {};

    // Agregar órdenes
    orders.forEach((order: any) => {
      const meal = meals.find((m: any) => m.meal_id === order.meal_id);
      if (meal) {
        if (!mealStats[order.meal_id]) {
          mealStats[order.meal_id] = {
            meal_name: meal.meal_name,
            unidades: 0,
            ratings: [],
            food_cost_pct: meal.food_cost_pct || 0,
          };
        }
        mealStats[order.meal_id].unidades += order.unidades || 0;
      }
    });

    // Agregar ratings
    feedbacks.forEach((f: any) => {
      if (mealStats[f.meal_id]) {
        mealStats[f.meal_id].ratings.push(f.rating);
      }
    });

    // Transformar a array y calcular promedio
    const topMeals = Object.values(mealStats)
      .map((stat) => ({
        meal_name: stat.meal_name,
        unidades: stat.unidades,
        rating: stat.ratings.length > 0
          ? Math.round((stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length) * 10) / 10
          : null,
        foodcost_pct: stat.food_cost_pct,
      }))
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: topMeals });
  } catch (error) {
    console.error("[/api/carta/data/top-meals]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
