import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { purchaseOrderLineItems } from "@/app/config/schema";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    // Optional: Validate data here

    // Insert in batch
    await db.insert(purchaseOrderLineItems).values(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}
