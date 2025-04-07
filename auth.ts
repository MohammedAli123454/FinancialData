// auth.ts (at root level)
import { getServerSession } from "auth/server";
import { authOptions } from "@/auth-options";

export async function auth(request: Request) {
  return await getServerSession(authOptions, request);
}
