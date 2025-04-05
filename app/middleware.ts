// src/middleware.ts
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/auth";

// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   console.log('Middleware session:', session?.user?.email);

//   // Protect API routes
//   if (request.nextUrl.pathname.startsWith('/api')) {
//     if (!session) {
//       return new NextResponse(
//         JSON.stringify({ error: "Unauthorized" }),
//         { status: 401, headers: { 'Content-Type': 'application/json' } }
//       );
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/api/:path*", "/dashboard"],  // Add protected routes
// };