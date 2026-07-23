import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/auth/session';
import { authorizeDocumentUpload, finalizeDocumentUpload } from '@/server/data/uploads';
import { findDocument } from '@/server/data/documents';
import { assertSameOrigin, errorResponse } from '@/server/http';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await request.json();
    if (body.action === 'authorize') {
      return NextResponse.json(await authorizeDocumentUpload(id, body));
    }
    if (body.action === 'finalize') {
      await finalizeDocumentUpload(id);
      return NextResponse.json(await findDocument(id));
    }
    return NextResponse.json({ message: 'Aksi upload tidak valid.' }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
