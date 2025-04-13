'use server';

import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Define the schema for sign in data if not defined already
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInData = z.infer<typeof signInSchema>;

export async function signIn(data: z.infer<typeof signInSchema>) {
  try {
    // Validate the incoming data using zod
    const parsedData = signInSchema.parse(data);
    
    // Query user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsedData.email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password with stored hash
    const passwordIsValid = await comparePassword(parsedData.password, user.password);
    if (!passwordIsValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token and set authentication cookie
    const token = generateToken(user);
    await setAuthCookie(token);

    // Redirect to the protected dashboard
    redirect('/dashboard');
  } catch (error) {
    // Return or rethrow error depending on your error handling strategy
    return { error: error instanceof Error ? error.message : 'Authentication failed' };
  }
}
