import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHoliday, listHolidays } from '@/server/data/holidays';
import { requireAdminSession } from '@/server/auth/session';
import { assertSameOrigin, errorResponse } from '@/server/http';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const value = request.nextUrl.searchParams.get('year');
    const year = value ? z.coerce.number().int().min(2020).max(2100).parse(value) : undefined;
    return NextResponse.json(await listHolidays(year));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    return NextResponse.json(await createHoliday(await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
