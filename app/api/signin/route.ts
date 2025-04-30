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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

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

    // Build response and set cookie via helper
    const isProd = process.env.NODE_ENV === 'production';
    const res = NextResponse.json({ message: 'Signed in successfully' });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60,
      secure: isProd,
    });

    return res;

  } catch (err: any) {
    console.error('Signin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}