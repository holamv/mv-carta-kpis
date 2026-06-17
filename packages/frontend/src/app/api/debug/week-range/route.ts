import { NextRequest, NextResponse } from "next/server";
import { weekStringToDateRange } from "@/carta/adapters/utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const week = request.nextUrl.searchParams.get("week") || "W24-2026";

    const range = weekStringToDateRange(week);

    // Verificar datos en ese rango
    const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

    const ordersResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?select=order_date&order_date=gte.${range.start}&order_date=lte.${range.end}&select=count()`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const ordersCountHeader = ordersResponse.ok
      ? ordersResponse.headers.get("content-range")
      : "error";

    // Obtener muestra de órdenes en ese rango
    const sampleResponse = await fetch(
      `${SUPABASE_URL}/meal_orders_daily?order_date=gte.${range.start}&order_date=lte.${range.end}&limit=3&order=order_date.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const sample = sampleResponse.ok ? await sampleResponse.json() : [];

    return NextResponse.json({
      success: true,
      week,
      calculated_range: range,
      data: {
        count_in_range: ordersCountHeader,
        sample_orders: sample,
      },
    });
  } catch (error) {
    console.error("[/api/debug/week-range]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error",
      },
      { status: 500 }
    );
  }
}
