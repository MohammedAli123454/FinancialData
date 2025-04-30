// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'auth_token'

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export const config = {
  matcher: [
    '/((?!$|signin$|api/signin$|_next/|favicon\\.ico).*)',
  ],
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl

  // 1) Skip the signin page itself, Next internals, etc.
  if (
    pathname === '/signin' ||
    pathname.startsWith('/api/signin') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 2) Extract token from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value

  // Helper to respond with JSON
  function jsonError(message: string, status: number) {
    return new NextResponse(
      JSON.stringify({ message }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Helper to redirect to signin for non-API pages
  function redirectToSignIn() {
    const signInUrl = new URL('/signin', origin)
    return NextResponse.redirect(signInUrl)
  }

  // 3) No token?  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return jsonError('Authentication required', 401)
    } else {
      return redirectToSignIn()
    }
  }

  // 4) Verify token
  let payload: { role: string }
  try {
    const { payload: verified } = await jwtVerify(token, getSecretKey())
    payload = verified as { role: string }
  } catch (err) {
    console.error('JWT verification error:', err)
    if (pathname.startsWith('/api/')) {
      return jsonError('Invalid token', 401)
    } else {
      return redirectToSignIn()
    }
  }

  // 5) Role‐based guards
  const method = req.method.toUpperCase()
  if (method === 'DELETE' && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return jsonError( 'You do not have rights to delete partial invoice', 403)
    }
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    !['admin', 'superuser'].includes(payload.role)
  ) {
    if (pathname.startsWith('/api/')) {
      return jsonError(
        'You do not have rights to add or update the partial invoice',
        403
      )
    }
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 6) All good → continue
  return NextResponse.next()
}
