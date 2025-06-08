import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { invoices1, invoice_details } from "@/app/config/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const { customer_id, invoice_date, invoice_type, invoice_term, payment_terms, notes, details } = body;

  const [invoice] = await db.insert(invoices1).values({
    customer_id,
    invoice_date, // Make sure this is a string like "2024-06-11"
    invoice_type,
    invoice_term,
    payment_terms,
    notes,
    created_at: new Date().toISOString().slice(0, 10), // <-- FIXED
  }).returning();

  for (let i = 0; i < details.length; i++) {
    const d = details[i];
    await db.insert(invoice_details).values({
      invoice_id: invoice.id,
      item_id: d.item_id,
      sr_no: i + 1,
      qty: String(d.qty),
      price: String(d.price),
      total: String(Number(d.qty) * Number(d.price)),
    });
  }
  return NextResponse.json({ success: true, invoice_id: invoice.id });
}
