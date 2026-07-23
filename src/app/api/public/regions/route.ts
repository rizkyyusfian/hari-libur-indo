import { NextResponse } from 'next/server';
import { listRegions } from '@/server/data/regions';
import { errorResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await listRegions());
  } catch (error) {
    return errorResponse(error);
  }
}
