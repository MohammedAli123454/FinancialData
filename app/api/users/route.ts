// app/api/users/route.ts
import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq, or } from "drizzle-orm";
import { z } from 'zod';

const signUpSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'Super User', 'User']).optional().default('User')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = signUpSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, email, password, role } = validation.data;

    // Check existing user
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const newUser = await db.insert(users).values({ 
      username, 
      email, 
      password: hashedPassword, 
      role 
    }).returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}