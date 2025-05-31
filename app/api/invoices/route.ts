import { NextResponse } from "next/server";
import { db } from '@/app/config/db';
import { invoices, suppliers } from '@/app/config/schema';
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
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
          supplier_name: suppliers.Supplier, // Drizzle will alias as "supplier_name"
          po_number: invoices.po_number,
          contract_type: invoices.contract_type,
          certified: invoices.certified,
          created_at: invoices.created_at,
        })
        .from(invoices)
        .leftJoin(suppliers, eq(invoices.supplier_id, suppliers.id))
        .orderBy(desc(invoices.id));
  
      // supplier_name is already top-level, no need to dig into "suppliers"
      const formatted = data.map((inv) => ({
        ...inv,
        invoice_amount: Number(inv.invoice_amount).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        payable: Number(inv.payable).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        // supplier_name is already present if a join matched, otherwise undefined
        supplier_name: inv.supplier_name || inv.supplier_id,
      }));
  
      return NextResponse.json({ data: formatted }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ error: "Failed to fetch invoices", detail: String(err) }, { status: 500 });
    }
  }
  