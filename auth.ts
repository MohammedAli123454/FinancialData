///auth.ts
import { Auth } from "@auth/core";
import type { AuthConfig, DefaultSession, User } from "@auth/core/types";
import type { JWT } from "@auth/core/jwt";
import Credentials from "@auth/core/providers/credentials";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";

// Type extensions
declare module "@auth/core/types" {
  interface Session extends DefaultSession {
    user: {
      role: "admin" | "Super User" | "User";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "Super User" | "User";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "admin" | "Super User" | "User";
  }
}

export const authConfig: AuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        const user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user || !(await verifyPassword(password, user.password))) return null;

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

// Create auth instance for middleware
export const auth: any = (request: Request) => Auth(request, authConfig);

// Create handlers with proper typing for //app/api/auth/[...nextauth]/route.ts

export const GET = (request: Request) => Auth(request, authConfig);
export const POST = (request: Request) => Auth(request, authConfig);

