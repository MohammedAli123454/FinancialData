'use server';

import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/utils/auth';

export async function signupAction(formData: FormData) {
  // Only an authenticated admin can create new users
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized: only admins can create new users');
  }

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rawRole = formData.get('role');

  if (!username || !email || !password || typeof rawRole !== 'string') {
    throw new Error('All fields are required');
  }

  // Narrow rawRole to the allowed union type
  if (!['admin', 'superuser', 'user'].includes(rawRole)) {
    throw new Error('Invalid role');
  }
  const role = rawRole as 'admin' | 'superuser' | 'user';

  // Ensure only one admin exists
  if (role === 'admin') {
    const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin'));
    if (existingAdmin.length > 0) {
      throw new Error('An admin user already exists');
    }
  }

  // Prevent duplicate emails
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
    role,
  });

  redirect('/signin');
}