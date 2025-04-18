'use server';

import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function signupAction(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!username || !email || !password) throw new Error('All fields are required');

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, email, password: hashedPassword });

  redirect('/signin');
}
