import { db } from '@/app/config/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: { supplierId: string } }) {
  const { supplierId } = context.params;

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
}
