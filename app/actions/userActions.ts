// 'use server';

// import { db } from '@/app/config/db';
// import { users, registerSchema } from '@/app/config/schema';
// import { eq } from 'drizzle-orm';
// import { hash } from 'bcryptjs';
// import { z } from 'zod';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// // Define TypeScript interfaces
// export type FormValues = {
//   id?: string;
//   username: string;
//   password?: string;
//   role: string;
// };

// export type SafeUser = {
//   id: number;
//   username: string;
//   role: string;
// };

// // Extend your schema for updates (password optional on update)
// const updateUserSchema = registerSchema
//   .omit({ password: true })
//   .extend({
//     password: z.string().min(8, 'Password must be at least 8 characters').optional(),
//     id: z.string().min(1, 'ID is required')
//   });

// // Helper to ensure only admin users can perform these actions.
// async function requireAdmin() {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user.role !== 'admin') {
//     throw new Error('Unauthorized: Admins only');
//   }
//   return session;
// }

// export async function createUser(
//   data: unknown
// ): Promise<{ error?: string; success?: boolean }> {
//   try {
//     await requireAdmin();

//     // Validate input data using your register schema.
//     const validatedData = await registerSchema.parseAsync(data);

//     // Check if the username already exists.
//     const existingUser = await db.query.users.findFirst({
//       where: eq(users.username, validatedData.username),
//     });
//     if (existingUser) {
//       return { error: 'Username already exists' };
//     }

//     // Ensure only one admin account exists.
//     if (validatedData.role === 'admin') {
//       const existingAdmin = await db.query.users.findFirst({
//         where: eq(users.role, 'admin'),
//       });
//       if (existingAdmin) {
//         return { error: 'Admin account already exists' };
//       }
//     }

//     const hashedPassword = await hash(validatedData.password, 12);

//     await db.insert(users).values({
//       username: validatedData.username,
//       password: hashedPassword,
//       role: validatedData.role,
//     });

//     return { success: true };
//   } catch (error) {
//     return { error: error instanceof Error ? error.message : 'Registration failed' };
//   }
// }

// export async function getUsers(): Promise<SafeUser[]> {
//   // Ensure only admin users can fetch the list.
//   await requireAdmin();

//   const result = await db.select({
//     id: users.id,
//     username: users.username,
//     role: users.role
//   }).from(users);

//   return result.map(user => ({
//     ...user,
//     id: Number(user.id)
//   }));
// }

// export async function updateUser(
//   data: FormValues
// ): Promise<{ error?: string; success?: boolean; id?: string }> {
//   try {
//     await requireAdmin();

//     const validatedData = await updateUserSchema.parseAsync({
//       ...data,
//       id: data.id?.toString()
//     });

//     // Check if switching to admin: if user is not already admin, ensure no admin exists.
//     const currentUser = await db.query.users.findFirst({
//       where: eq(users.id, Number(validatedData.id))
//     });
//     if (validatedData.role === 'admin' && currentUser && currentUser.role !== 'admin') {
//       const existingAdmin = await db.query.users.findFirst({
//         where: eq(users.role, 'admin'),
//       });
//       if (existingAdmin) {
//         return { error: 'Admin account already exists' };
//       }
//     }

//     const updateData: { username: string; role: string; password?: string } = {
//       username: validatedData.username,
//       role: validatedData.role,
//     };

//     if (validatedData.password) {
//       updateData.password = await hash(validatedData.password, 12);
//     }

//     await db.update(users)
//       .set(updateData)
//       .where(eq(users.id, Number(validatedData.id)));

//     return { success: true, id: validatedData.id };
//   } catch (error) {
//     return { error: error instanceof Error ? error.message : 'Update failed' };
//   }
// }

// export async function deleteUser(
//   userId: string
// ): Promise<{ error?: string; success?: boolean }> {
//   try {
//     await requireAdmin();

//     await db.delete(users).where(eq(users.id, Number(userId)));
//     return { success: true };
//   } catch (error) {
//     return { error: error instanceof Error ? error.message : 'Delete failed' };
//   }
// }

"use server";

import bcrypt from "bcryptjs";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";


export async function createUser(data: FormData) {
  const username = data.get("username") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const role = data.get("role") as string;

  if (!username || !email || !password || !role) {
    throw new Error("Missing required fields");
  }

  const hashedPassword = await bcrypt.hash(password, 10);


  await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
    role,
  });
}
