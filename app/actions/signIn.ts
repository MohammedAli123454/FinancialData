'use server';

import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'auth_token';

export async function signinAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) throw new Error('Email and password are required');

  const user = await db.select().from(users).where(eq(users.email, email));
  if (user.length === 0) throw new Error('Invalid email or password');

  const isValid = await bcrypt.compare(password, user[0].password);
  if (!isValid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user[0].id, username: user[0].username, role: user[0].role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const cookieStore = await cookies();
cookieStore.set(COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 2,
  path: '/',
});

  // redirect('/dashboard');
  redirect('/');

}