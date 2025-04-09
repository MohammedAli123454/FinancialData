// middleware.ts
import { auth } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const response = await auth(req);
  const session = await response.json().catch(() => null);
  const url = req.nextUrl.clone();

  // Public routes
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Authentication required
  if (!session?.user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Admin-only routes
  if (req.nextUrl.pathname.startsWith('/api/users') && session.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ['/((?!login|signup|public|_next/static|_next/image|favicon.ico).*)'] 
};