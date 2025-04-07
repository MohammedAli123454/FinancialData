// /app/api/auth/[...auth]/route.ts

import { auth } from "@/app/config/auth";
import Auth from "auth";

const handler = Auth(auth);
export { handler as GET, handler as POST };
