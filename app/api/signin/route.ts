// app/api/signin/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

const JWT_SECRET  = process.env.JWT_SECRET!;
const COOKIE_NAME = 'auth_token';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Set cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${2 * 60 * 60}${isProd ? '; Secure' : ''}`;

    const res = NextResponse.json({ message: 'Signed in successfully' });
    res.headers.append('Set-Cookie', cookie);
    return res;

  } catch (err: any) {
    console.error('Signin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
