"use server";

import { auth } from "@/auth";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";
import { hash } from "bcryptjs";
import { z, ZodError } from "zod";
import { eq, or } from "drizzle-orm";

// Define the user registration schema.
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "Super User", "User"]),
});

export async function createUser(data: FormData) {
  try {
    // Verify admin session
    const serverSession = await auth();

    if (!serverSession?.user || serverSession.user.role !== "admin") {
  
      throw new Error("Unauthorized: Only admins can create users reords");
    }

    // Parse & normalize input
    const raw = Object.fromEntries(data.entries());
    const normalized = {
      username: String(raw.username).trim(),
      email: String(raw.email).trim().toLowerCase(),
      password: String(raw.password),
      role: String(raw.role).trim() as "admin" | "Super User" | "User",
    };

    // Validate
    const result = registerSchema.safeParse(normalized);
    if (!result.success) {
      throw new Error(result.error.errors.map(e => e.message).join("; "));
    }
    const { username, email, password, role } = result.data;

    // Check for duplicates
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });
    if (existing) {
      throw new Error("Username or email already exists");
    }

    // Hash & insert
    const hashed = await hash(password, 12);
    const [newUser] = await db
      .insert(users)
      .values({ username, email, password: hashed, role })
      .returning();

    return newUser;
  } catch (err) {
    // Zod errors vs others
    if (err instanceof ZodError) {
      console.error("Validation error:", err.errors);
      throw new Error(err.errors.map(e => e.message).join("; "));
    }
    console.error("createUser error:", err);
    throw err;
  }
}
