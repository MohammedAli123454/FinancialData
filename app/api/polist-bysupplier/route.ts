// /app/api/po-numbers/route.ts
import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { purchaseOrders } from "@/app/config/schema";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const supplierId = searchParams.get("supplier_id");

  if (!supplierId) {
    return NextResponse.json({ error: "Missing supplier_id" }, { status: 400 });
  }

  try {
    const data = await db.execute(
      sql`
        SELECT po_number
        FROM ${purchaseOrders}
        WHERE supplier_id = ${supplierId}
        ORDER BY po_number
      `
    );
    return NextResponse.json({ data: data.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch PO numbers" }, { status: 500 });
  }
}
