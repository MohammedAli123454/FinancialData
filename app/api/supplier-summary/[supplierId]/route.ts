import { db } from '@/app/config/db';
import { sql } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Extract `supplierId` from the URL path, e.g. "/api/supplier-summary/123"
    const segments = req.nextUrl.pathname.split('/');
    const supplierId = segments.at(-1); // The last segment is the supplierId

    if (!supplierId) {
      return NextResponse.json(
        { success: false, message: "Missing supplierId in the URL" },
        { status: 400 }
      );
    }

    const result = await db.execute(sql`
      SELECT 
        p.po_number AS "poNumber",
        p.currency,
        p.po_value AS "poValue",  -- Original PO value
        p.po_value_with_vat AS "poValueWithVAT",  -- Original PO value with VAT
        (p.po_value * r.rate) AS "poValueInSAR",  -- PO value converted to SAR
        (p.po_value_with_vat * r.rate) AS "poValueWithVATInSAR"  -- PO value with VAT converted to SAR
      FROM purchase_orders p
      JOIN currency_rates r ON p.currency = r.currency
      WHERE p.supplier_id = ${supplierId}
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch supplier data" },
      { status: 500 }
    );
  }
}
