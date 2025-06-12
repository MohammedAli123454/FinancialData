// app/api/purchase-order-line-items/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { purchaseOrderLineItems } from "@/app/config/schema";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    console.log("Received data:", data);

    if (!Array.isArray(data) || !data.length) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Try inserting, print the first row structure
    try {
      await db.insert(purchaseOrderLineItems).values(data);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Drizzle Insert Error:", err);
      return NextResponse.json({ error: String(err) }, { status: 400 });
    }
  } catch (error) {
    console.error("Outer API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
