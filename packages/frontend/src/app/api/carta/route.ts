import { NextResponse } from 'next/server';
import { getWeeklyCartaReport } from '@/carta/service';

export async function GET() {
  const res = await getWeeklyCartaReport();
  return NextResponse.json(res);
}
