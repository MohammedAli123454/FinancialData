import { db } from "@/app/config/db";
import { invoices, purchaseOrders, suppliers } from "@/app/config/schema";
import { eq, and, gte, lte, gt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/supplier-statement
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = Number(searchParams.get("supplierId"));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!supplierId)
      return NextResponse.json({ error: "Missing supplierId" }, { status: 400 });

    // Fetch PO summary
    const pos = await db
      .select({
        id: purchaseOrders.id,
        poNumber: purchaseOrders.poNumber,
        poValue: purchaseOrders.poValue,
        poValueWithVAT: purchaseOrders.poValueWithVAT,
      })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.supplierId, supplierId));

    const totalPOs = pos.length;
    const totalPOValue = pos.reduce(
      (sum, p) => sum + Number(p.poValueWithVAT || 0),
      0
    );

    // Fetch Supplier Name
    const [supplier] = await db
      .select({ name: suppliers.Supplier })
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1);

    // Invoices query with only gt(invoices.payable, 0)
    let invoiceWhere = [
      eq(invoices.supplier_id, supplierId),
      eq(invoices.certified, true),
      gt(invoices.payable, "0"), // <-- string not number!
    ];
    
    if (startDate) invoiceWhere.push(gte(invoices.certified_date, startDate));
    if (endDate) invoiceWhere.push(lte(invoices.certified_date, endDate));

    const invoiceRows = await db
      .select({
        certified_date: invoices.certified_date,
        invoice_no: invoices.invoice_no,
        invoice_date: invoices.invoice_date,
        payment_type: invoices.payment_type,
        payment_due_date: invoices.payment_due_date,
        invoice_amount: invoices.invoice_amount,
        payable: invoices.payable,
        po_number: invoices.po_number,
        contract_type: invoices.contract_type,
      })
      .from(invoices)
      .where(and(...invoiceWhere));

    const totalCertified = invoiceRows.reduce(
      (sum, inv) => sum + Number(inv.payable || 0),
      0
    );

    return NextResponse.json({
      supplier: supplier?.name || "",
      totalPOs,
      totalPOValue,
      invoices: invoiceRows,
      totalCertified,
      balance: totalPOValue - totalCertified,
      pos,
    });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
