'use server';

import { db } from '@/app/config/db';
import { users } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function seedAdmin() {
  // Check if an admin already exists.
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.role, 'admin'),
  });

  if (existingAdmin) {
    return { success: false, message: 'Admin user already exists. Seeding aborted.' };
  }

  // Use environment variables or fallback defaults.
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'adminpassword';

  if (password.length < 8) {
    return { success: false, message: 'Admin password must be at least 8 characters.' };
  }

  // Hash the admin password.
  const hashedPassword = await hash(password, 12);

  // Insert the new admin user record.
  await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
    role: 'admin',
  });

  return { success: true, message: `Admin user created successfully with username: ${username}` };
}
