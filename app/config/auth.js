// /app/config/auth.js

import Auth from "auth";
import CredentialsProvider from "auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "auth/server";

/**
 * @type {import("auth").AuthOptions}
 */
export const auth = {
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

        const [userRecord] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

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
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// Export the Auth.js handler for API routes
const handler = Auth(auth);
export { handler as GET, handler as POST };

/**
 * Convenience wrapper to fetch the session on the server.
 * Pass in the Request so cookies and headers can be read.
 *
 * @param {Request} request
 */
export async function getAuthSession(request) {
  return getServerSession(auth, request);
}
