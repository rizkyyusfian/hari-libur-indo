import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listDocuments } from '@/server/data/documents';
import { errorResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const value = request.nextUrl.searchParams.get('year');
    const year = value ? z.coerce.number().int().min(2020).max(2100).parse(value) : undefined;
    return NextResponse.json(await listDocuments(true, year));
  } catch (error) {
    return errorResponse(error);
  }
}
