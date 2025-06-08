import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/config/db';
import { invoices, suppliers } from '@/app/config/schema';
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: Fetch invoices with supplier name
export async function GET(req: NextRequest) {
  try {
    // Extract pagination params
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const data = await db
      .select({
        id: invoices.id,
        certified_date: invoices.certified_date,
        invoice_no: invoices.invoice_no,
        invoice_date: invoices.invoice_date,
        payment_type: invoices.payment_type,
        payment_due_date: invoices.payment_due_date,
        invoice_amount: invoices.invoice_amount,
        payable: invoices.payable,
        supplier_id: invoices.supplier_id,
        supplier_name: suppliers.Supplier,
        po_number: invoices.po_number,
        contract_type: invoices.contract_type,
        certified: invoices.certified,
        created_at: invoices.created_at,
      })
      .from(invoices)
      .leftJoin(suppliers, eq(invoices.supplier_id, suppliers.id))
      .orderBy(desc(invoices.id))
      .limit(limit)
      .offset(offset);

    // Optional: Get total count for frontend if you want
    // const [{ count }] = await db.select({ count: sql`count(*)` }).from(invoices);

    const formatted = data.map((inv) => ({
      ...inv,
      invoice_amount: Number(inv.invoice_amount).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      payable: Number(inv.payable).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      supplier_name: inv.supplier_name || inv.supplier_id,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch invoices", detail: String(err) }, { status: 500 });
  }
}


// POST: Create a new invoice
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Optional: Validate fields here if you want.
    // Remove any extra fields or transform dates/decimals as needed

    // Insert new invoice into DB
    const [newInvoice] = await db.insert(invoices).values({
      certified_date: body.certified_date ?? null,
      invoice_no: body.invoice_no,
      invoice_date: body.invoice_date,
      payment_type: body.payment_type,
      payment_due_date: body.payment_due_date,
      invoice_amount: body.invoice_amount,
      payable: body.payable,
      supplier_id: body.supplier_id,
      po_number: body.po_number,
      contract_type: body.contract_type,
      certified: body.certified ?? false,
      created_at: body.created_at ?? new Date(), // optional: let DB default handle this
    }).returning();

    return NextResponse.json({ data: newInvoice }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create invoice", detail: String(err) }, { status: 500 });
  }
}
