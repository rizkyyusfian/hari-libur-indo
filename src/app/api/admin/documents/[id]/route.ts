import { NextRequest, NextResponse } from 'next/server';
import {
  archiveDocument,
  deleteDocumentMetadata,
  findDocument,
  publishDocument,
  updateDocument,
} from '@/server/data/documents';
import { requireAdminSession } from '@/server/auth/session';
import { assertSameOrigin, errorResponse } from '@/server/http';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    return NextResponse.json(await findDocument(id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    const body = await request.json();
    if (body.action === 'publish') {
      await publishDocument(id);
      return NextResponse.json(await findDocument(id));
    }
    if (body.action === 'archive') {
      await archiveDocument(id);
      return NextResponse.json(await findDocument(id));
    }
    return NextResponse.json(await updateDocument(id, body));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    await deleteDocumentMetadata(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
