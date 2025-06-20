import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { purchaseOrders } from "@/app/config/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.execute(
      sql`
        SELECT po_number
        FROM ${purchaseOrders}
        WHERE master_po IS NULL
        ORDER BY po_number
      `
    );
    // Returns: [{ po_number: '...' }, ...]
    return NextResponse.json({ data: data.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch PO numbers" }, { status: 500 });
  }
}
