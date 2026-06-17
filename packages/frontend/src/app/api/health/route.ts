import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT 1 as ok");
    
    return NextResponse.json({
      success: true,
      data: {
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: `Database connection failed: ${message}`,
          code: "DB_CONNECTION_ERROR",
        },
      },
      { status: 503 }
    );
  }
}
