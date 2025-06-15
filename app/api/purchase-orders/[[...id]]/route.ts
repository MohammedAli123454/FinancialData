import { db } from "@/app/config/db";
import { purchaseOrders, suppliers, purchaseOrderLineItems } from "@/app/config/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";

// GET all purchase orders (with supplier and line items)
export async function GET() {
  try {
    const data = await db.select({
      id: purchaseOrders.id,
      supplierId: purchaseOrders.supplierId,
      poNumber: purchaseOrders.poNumber,
      currency: purchaseOrders.currency,
      poValue: purchaseOrders.poValue,
      poValueWithVAT: purchaseOrders.poValueWithVAT,
      masterPo: purchaseOrders.masterPo,
      supplierName: suppliers.Supplier,
    })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id));

    // Fetch all line items in one go, grouped by PO
    const poIds = data.map(po => po.id);
    const lineItems = poIds.length
      ? await db.select().from(purchaseOrderLineItems).where(inArray(purchaseOrderLineItems.purchaseOrderId, poIds))
      : [];

    const grouped: Record<number, any[]> = {};
    for (const li of lineItems) {
      if (!grouped[li.purchaseOrderId]) grouped[li.purchaseOrderId] = [];
      grouped[li.purchaseOrderId].push(li);
    }

    const result = data.map(po => ({
      ...po,
      lineItems: grouped[po.id] || [],
    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

// POST create purchase order (with line items)
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
      masterPo: body.masterPo || null,
    }).returning();

    if (body.lineItems && Array.isArray(body.lineItems)) {
      const itemsToInsert = body.lineItems.map((li: any, i: number) => ({
        ...li,
        purchaseOrderId: created.id,
        supplierId: body.supplierId,
        poNumber: body.poNumber,
        masterPo: body.masterPo || null,
        lineNo: i + 1,
        dateAdd: new Date(),
        dateEdit: new Date(),
      }));
      if (itemsToInsert.length)
        await db.insert(purchaseOrderLineItems).values(itemsToInsert);
    }

    return NextResponse.json({ data: created });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}

// PUT update purchase order + line items (full replace)
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
      masterPo: body.masterPo || null,
    }).where(eq(purchaseOrders.id, id)).returning();

    // Remove all previous line items and insert new
    await db.delete(purchaseOrderLineItems).where(eq(purchaseOrderLineItems.purchaseOrderId, id));
    if (Array.isArray(body.lineItems) && body.lineItems.length) {
      const itemsToInsert = body.lineItems.map((li: any, i: number) => ({
        ...li,
        purchaseOrderId: id,
        supplierId: body.supplierId,
        poNumber: body.poNumber,
        masterPo: body.masterPo || null,
        lineNo: i + 1,
        dateAdd: new Date(),
        dateEdit: new Date(),
      }));
      await db.insert(purchaseOrderLineItems).values(itemsToInsert);
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to update PO" }, { status: 500 });
  }
}

// DELETE purchase order + its line items
export async function DELETE(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    await db.delete(purchaseOrderLineItems).where(eq(purchaseOrderLineItems.purchaseOrderId, id));
    const deleted = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id)).returning();
    if (!deleted.length)
      return NextResponse.json({ success: false, message: "PO not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete PO" }, { status: 500 });
  }
}
