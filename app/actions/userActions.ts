'use server';
import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { registerSchema } from '@/app/config/schema';
import { z } from 'zod';

// Define TypeScript interfaces
type FormValues = {
  id?: string;
  username: string;
  password?: string;
  role: string;
};

export type SafeUser = {
  id: number;
  username: string;
  role: string;
};

// Update user schema with proper validation
const updateUserSchema = registerSchema
  .omit({ password: true })
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    id: z.string().min(1, 'ID is required')
  });

export async function createUser(
  data: unknown
): Promise<{ error?: string; success?: boolean }> {
  try {
    const validatedData = await registerSchema.parseAsync(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, validatedData.username),
    });

    if (existingUser) {
      return { error: 'Username already exists' };
    }

    if (validatedData.role === 'admin') {
      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.role, 'admin'),
      });
      if (existingAdmin) {
        return { error: 'Admin account already exists' };
      }
    }

    const hashedPassword = await hash(validatedData.password, 12);

    await db.insert(users).values({
      username: validatedData.username,
      password: hashedPassword,
      role: validatedData.role,
    });

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
}

export async function getUsers(): Promise<SafeUser[]> {
  const result = await db.select({
    id: users.id,
    username: users.username,
    role: users.role
  }).from(users);
  
  return result.map(user => ({
    ...user,
    id: Number(user.id)
  }));
}

export async function updateUser(
  data: FormValues
): Promise<{ error?: string; success?: boolean; id?: string }> {
  try {
    const validatedData = await updateUserSchema.parseAsync({
      ...data,
      id: data.id?.toString()
    });

    // Check for admin role update restriction:
    // If the user is being changed to admin and wasn't admin already,
    // ensure that no other admin exists.
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, Number(validatedData.id))
    });
    if (validatedData.role === 'admin' && currentUser && currentUser.role !== 'admin') {
      const existingAdmin = await db.query.users.findFirst({
        where: eq(users.role, 'admin'),
      });
      if (existingAdmin) {
        return { error: 'Admin account already exists' };
      }
    }

    const updateData: { username: string; role: string; password?: string } = {
      username: validatedData.username,
      role: validatedData.role,
    };

    if (validatedData.password) {
      updateData.password = await hash(validatedData.password, 12);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, Number(validatedData.id)));

    return { success: true, id: validatedData.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Update failed' };
  }
}

export async function deleteUser(
  userId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await db.delete(users).where(eq(users.id, Number(userId)));
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Delete failed' };
  }
}
