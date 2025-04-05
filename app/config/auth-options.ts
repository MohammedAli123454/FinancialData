// config/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/app/config/db";
import { users } from "@/app/config/schema";
import { eq } from "drizzle-orm";
import type { JWT } from "next-auth/jwt";

// Extended type declarations
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .then((res) => res[0]);

        if (
          !userRecord ||
          !(await bcrypt.compare(credentials.password, userRecord.password))
        ) {
          return null;
        }

        return {
          id: String(userRecord.id),
          email: userRecord.email,
          role: userRecord.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

};