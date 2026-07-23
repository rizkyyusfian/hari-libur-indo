import { NextResponse } from 'next/server';
import { listRegions } from '@/server/data/regions';
import { requireAdminSession } from '@/server/auth/session';
import { errorResponse } from '@/server/http';

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json(await listRegions());
  } catch (error) {
    return errorResponse(error);
  }
}
