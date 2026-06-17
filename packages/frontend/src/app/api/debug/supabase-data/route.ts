import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Datos de meals (platos)
    const mealsResponse = await fetch(
      `${SUPABASE_URL}/meals?select=meal_id,meal_name,protein_type,is_star,is_active,country&limit=10`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const meals = mealsResponse.ok ? await mealsResponse.json() : [];

    // Datos de stores (tiendas)
    const storesResponse = await fetch(
      `${SUPABASE_URL}/stores?select=store_id,store_name,city,country&limit=10`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const stores = storesResponse.ok ? await storesResponse.json() : [];

    // Datos de meal_feedbacks (calificaciones)
    const feedbacksResponse = await fetch(
      `${SUPABASE_URL}/meal_feedbacks?select=meal_id,rating&limit=10`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const feedbacks = feedbacksResponse.ok ? await feedbacksResponse.json() : [];

    // Datos de meal_orders_daily (ventas)
    const ordersResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=order_date,meal_id,store_id,unidades&limit=10`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const orders = ordersResponse.ok ? await ordersResponse.json() : [];

    return NextResponse.json({
      success: true,
      data: {
        meals: {
          count: meals.length,
          sample: meals.slice(0, 3),
        },
        stores: {
          count: stores.length,
          sample: stores.slice(0, 3),
        },
        feedbacks: {
          count: feedbacks.length,
          sample: feedbacks.slice(0, 3),
        },
        orders: {
          count: orders.length,
          sample: orders.slice(0, 3),
        },
      },
    });
  } catch (error) {
    console.error("[/api/debug/supabase-data]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
