// app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";
import { hash } from "bcryptjs";
import { z, ZodError } from "zod";
import { eq, or } from "drizzle-orm";
import { auth } from "@/auth";
// import { useSession, signOut } from "next-auth/react";

// 1. Define your Zod schema
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "Super User", "User"]),
});


// import { useSession, signOut } from "next-auth/react";
//   const { data: session, status } = useSession();


export async function POST(request: Request) {
  try {
    // 2. Enforce auth
    // const session = await getServerSession(authOptions);
   const serverSession = await auth();
   console.log("API Route Session:", serverSession); // Add debug logging
   if (!serverSession?.user || serverSession.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create users records" },
        { status: 401 }
      );
    }

    // 3. Parse form data
    const data = await request.formData();
    const raw = Object.fromEntries(data.entries());
    const normalized = {
      username: String(raw.username).trim(),
      email: String(raw.email).trim().toLowerCase(),
      password: String(raw.password),
      role: String(raw.role).trim() as "admin" | "Super User" | "User",
    };

    // 4. Validate
    const result = registerSchema.safeParse(normalized);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }
    const { username, email, password, role } = result.data;

    // 5. Check duplicates
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // 6. Hash & insert
    const hashed = await hash(password, 12);
    const [newUser] = await db
      .insert(users)
      .values({ username, email, password: hashed, role })
      .returning();

    // 7. Return the created user (omit password!)
    const { password: _pw, ...userWithoutPw } = newUser;
    return NextResponse.json(userWithoutPw, { status: 201 });
  } catch (err) {
    console.error("Error in /api/users:", err);
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error came" },
      { status: 500 }
    );
  }
}
