// app/api/suppliers/route.ts
import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { suppliers } from "@/app/config/schema";

export async function GET() {
  try {
    const data = await db.select().from(suppliers);
    // Your DB field is Supplier (not name!)
    const mapped = data.map(({ id, Supplier, location }) => ({
      id,
      name: Supplier,
      location,
    }));
    return NextResponse.json({ data: mapped });
  } catch {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}
