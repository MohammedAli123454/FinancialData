// app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";
import { hash } from "bcryptjs";
import { z, ZodError } from "zod";
import { eq, or } from "drizzle-orm";
import { getAuthSession } from "@/app/config/auth";

type UserRole = "admin" | "Super User" | "User";

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "Super User", "User"]),
});

export async function POST(request: Request) {
  let session;

  try {
    // Separate try/catch for auth errors
    session = await getAuthSession(request);
  } catch (authError) {
    console.error("Authentication error:", authError);
    return NextResponse.json(
      { error: "Authentication error. Please sign in again." },
      { status: 401 }
    );
  }

  // ✅ Now session is accessible here
  if (!session?.user?.role || session.user.role.toLowerCase() !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin privileges required" },
      { status: 401 }
    );
  }

  try {
    const requestData = await request.json();

    const result = registerSchema.safeParse({
      username: String(requestData.username).trim(),
      email: String(requestData.email).trim().toLowerCase(),
      password: String(requestData.password),
      role: String(requestData.role).trim() as UserRole,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }

    const { username, email, password, role } = result.data;

    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 12);
    const [newUser] = await db
      .insert(users)
      .values({ username, email, password: hashed, role })
      .returning();

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (err) {
    console.error("API Error:", err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
