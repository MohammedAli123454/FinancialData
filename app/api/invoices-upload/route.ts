import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/config/db';
import { invoices } from '@/app/config/schema';

export async function POST(req: NextRequest) {
    try {
      const data = await req.json();
      console.log("Received data:", data);
  
      if (!Array.isArray(data) || !data.length) {
        return NextResponse.json({ error: "No data received" }, { status: 400 });
      }
  
      const cleanRecords = data.filter((row: any) =>
        row.certified_date && row.invoice_no && row.invoice_date
        && row.payment_type && row.payment_due_date
        && row.supplier_id && row.po_number && row.contract_type
      );
  
      console.log("Clean records to insert:", cleanRecords);
  
      if (cleanRecords.length === 0) {
        return NextResponse.json({ error: "No valid records to insert" }, { status: 400 });
      }
  
      await db.insert(invoices).values(cleanRecords);
  
      return NextResponse.json({ success: true, count: cleanRecords.length });
    } catch (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to insert invoices" }, { status: 500 });
    }
  }
  
