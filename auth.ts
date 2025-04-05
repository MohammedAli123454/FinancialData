// auth.tss


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/config/auth-options"
export async function auth() {
  return await getServerSession(authOptions);
}