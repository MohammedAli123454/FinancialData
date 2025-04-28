import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'auth_token'

// Create secret key
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return new NextResponse('Authentication required', { status: 401 })
  }

  let payload: { role: string }
  try {
    const { payload: verifiedPayload } = await jwtVerify(token, getSecretKey())
    payload = verifiedPayload as { role: string }
  } catch (err) {
    console.error('JWT verification error:', err)
    return new NextResponse('Invalid token', { status: 401 })
  }

  const role = payload.role
  const method = req.method.toUpperCase()

  if (method === 'DELETE' && role !== 'admin') {
    return new NextResponse('Forbidden: delete requires admin', { status: 403 })
  }
  if (['POST', 'PUT', 'PATCH'].includes(method) &&
      !['admin', 'superuser'].includes(role)) {
    return new NextResponse('Forbidden: write requires admin or superuser', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!$|api/signin|signin|_next|favicon\\.ico).*)'],
}
