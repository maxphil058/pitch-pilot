import { NextResponse } from 'next/server';
import { VIDEO_V2_ENABLED } from '@/lib/flags';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    VIDEO_V2_ENABLED
  });
}
