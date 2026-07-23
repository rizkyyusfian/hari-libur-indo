import { NextRequest, NextResponse } from 'next/server';
import { deleteHoliday, findHoliday, updateHoliday } from '@/server/data/holidays';
import { requireAdminSession } from '@/server/auth/session';
import { assertSameOrigin, errorResponse } from '@/server/http';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    return NextResponse.json(await findHoliday(id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    return NextResponse.json(await updateHoliday(id, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await requireAdminSession();
    assertSameOrigin(request);
    const { id } = await context.params;
    await deleteHoliday(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
