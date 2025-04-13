// /lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import bcrypt from 'bcryptjs';
import { InferModel } from 'drizzle-orm';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'auth-token';

// Infer a User type from the drizzle schema definition for "users"
export type User = InferModel<typeof users>;

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const generateToken = (user: { id: number; role: string }): string => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (
  token: string
): { id: number; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch (error) {
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  // Await cookies() since it now returns a promise
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const verifiedToken = verifyToken(token);
  if (!verifiedToken) return null;

  // Select user from the database
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, verifiedToken.id))
    .limit(1);

  const user = userResult[0]; // Use the first row of the result
  return user || null;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
};

export const setAuthCookie = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, cookieOptions);
  };
  
  export const clearAuthCookie = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  };
