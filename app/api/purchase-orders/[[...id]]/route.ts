// app/api/purchase-orders/route.ts
import { db } from "@/app/config/db";
import { purchaseOrders, suppliers } from "@/app/config/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

// GET all purchase orders (joined with supplier)
export async function GET() {
  try {
    const data = await db.select({
      id: purchaseOrders.id,
      supplierId: purchaseOrders.supplierId,
      poNumber: purchaseOrders.poNumber,
      currency: purchaseOrders.currency,
      poValue: purchaseOrders.poValue,
      poValueWithVAT: purchaseOrders.poValueWithVAT,
      supplierName: suppliers.Supplier,
    })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

// POST create purchase order
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.supplierId || !body.poNumber || !body.currency || !body.poValue || !body.poValueWithVAT)
      return NextResponse.json({ error: "All PO fields required" }, { status: 400 });
    const [created] = await db.insert(purchaseOrders).values({
      supplierId: body.supplierId,
      poNumber: body.poNumber,
      currency: body.currency,
      poValue: body.poValue,
      poValueWithVAT: body.poValueWithVAT,
    }).returning();
    return NextResponse.json({ data: created });
  } catch {
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}

// PUT update purchase order
export async function PUT(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    const body = await request.json();
    if (!body.supplierId || !body.poNumber || !body.currency || !body.poValue || !body.poValueWithVAT)
      return NextResponse.json({ success: false, message: "All PO fields required" }, { status: 400 });
    const [updated] = await db.update(purchaseOrders).set({
      supplierId: body.supplierId,
      poNumber: body.poNumber,
      currency: body.currency,
      poValue: body.poValue,
      poValueWithVAT: body.poValueWithVAT,
    }).where(eq(purchaseOrders.id, id)).returning();
    if (!updated)
      return NextResponse.json({ success: false, message: "PO not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update PO" }, { status: 500 });
  }
}

// DELETE purchase order
export async function DELETE(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    const deleted = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id)).returning();
    if (!deleted.length)
      return NextResponse.json({ success: false, message: "PO not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete PO" }, { status: 500 });
  }
}
