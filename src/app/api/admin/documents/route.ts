import { NextRequest, NextResponse } from 'next/server';
import { createDocument, listDocuments } from '@/server/data/documents';
import { requireAdminSession } from '@/server/auth/session';
import { assertSameOrigin, errorResponse } from '@/server/http';

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json(await listDocuments(false));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    return NextResponse.json(await createDocument(await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
