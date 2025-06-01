import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/config/db';
import { invoices } from '@/app/config/schema';
import { eq } from "drizzle-orm";

// Edit/Update an invoice
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });

    const body = await req.json();
    // Remove undefined keys to avoid errors in update
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

    const result = await db
      .update(invoices)
      .set(body)
      .where(eq(invoices.id, id))
      .returning();

    if (!result.length) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ data: result[0] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update invoice", detail: String(err) }, { status: 500 });
  }
}

// Delete an invoice
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });

    const deleted = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();

    if (!deleted.length) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete invoice", detail: String(err) }, { status: 500 });
  }
}
