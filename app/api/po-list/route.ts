import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { purchaseOrders } from "@/app/config/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.execute(
      sql`
        SELECT DISTINCT master_po AS po_number
        FROM ${purchaseOrders}
        WHERE master_po IS NOT NULL AND master_po <> ''
        ORDER BY master_po
      `
    );
    // Now returns: [{ po_number: '4001' }, ...]
    return NextResponse.json({ data: data.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch PO numbers" }, { status: 500 });
  }
}
