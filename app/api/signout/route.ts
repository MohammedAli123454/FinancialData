// app/api/signout/route.ts
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_token';

export async function POST() {
  // Build a JSON 200 response rather than redirecting.
  const res = NextResponse.json({ success: true });
  
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',           // must match the original path
    maxAge: 0,           // expire immediately
    httpOnly: true,
    sameSite: 'lax',     // or 'strict' if you never need cross‐site
    secure: process.env.NODE_ENV === 'production',
    // If you ever need subdomain sharing:
    // domain: process.env.NODE_ENV === 'production'
    //   ? '.yourdomain.com'
    //   : undefined,
  });

  return res;
}
