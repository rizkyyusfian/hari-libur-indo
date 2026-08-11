import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicSnapshot } from '@/server/data/public-site';
import { errorResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(request: NextRequest) {
  try {
    const value = request.nextUrl.searchParams.get('year');
    const year = value ? z.coerce.number().int().min(2020).max(2100).parse(value) : undefined;
    const { documents } = await getPublicSnapshot(year);
    return NextResponse.json(documents, {
      headers: { 'Cache-Control': CACHE_CONTROL },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
