import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/server/auth/session';

export async function proxy(request: NextRequest) {
  const authenticated = await verifySessionToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value,
  );
  const loginPage = request.nextUrl.pathname === '/admin/login';

  if (loginPage && authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (!loginPage && !authenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
