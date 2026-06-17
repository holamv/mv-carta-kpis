import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://hzpycmczwkwbfrqzvfyz.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM";

async function supabaseQuery(table: string, limit: number = 5) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/${table}?limit=${limit}`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { error: `${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return { data, count: data.length };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Explorar tablas principales
    const tables = [
      "meals",
      "stores",
      "orders",
      "order_details",
      "order_feedbacks",
      "kitchens",
      "meal_categories",
    ];

    const results: Record<string, any> = {};

    for (const table of tables) {
      results[table] = await supabaseQuery(table, 3);
    }

    // Obtener estructura de tablas
    const structureResponse = await fetch(
      `${SUPABASE_URL}/`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      tables: results,
      note: "Verifica qué tablas y campos están disponibles",
    });
  } catch (error) {
    console.error("[/api/supabase-debug]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
