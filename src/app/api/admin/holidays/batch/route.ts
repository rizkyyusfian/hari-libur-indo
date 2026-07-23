import { NextRequest, NextResponse } from 'next/server';
import { createHolidayBatch } from '@/server/data/holidays';
import { requireAdminSession } from '@/server/auth/session';
import { assertSameOrigin, errorResponse } from '@/server/http';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    return NextResponse.json(await createHolidayBatch(await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
