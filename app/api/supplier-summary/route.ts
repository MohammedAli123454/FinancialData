import { db } from '@/app/config/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await db.execute(sql`
    SELECT 
      s.id AS "supplierId",
      s.name AS "supplier",
      s.location,
      r.rate AS "currencyRate",  -- Adding the conversion rate
      SUM(p.po_value) AS "poValue",  -- Original PO value
      SUM(p.po_value_with_vat) AS "poValueWithVAT",  -- Original PO value with VAT
      SUM(p.po_value * r.rate) AS "totalValueInSAR",  -- PO value converted to SAR
      SUM(p.po_value_with_vat * r.rate) AS "totalWithVATInSAR"  -- PO value with VAT converted to SAR
    FROM suppliers s
    JOIN purchase_orders p ON p.supplier_id = s.id
    JOIN currency_rates r ON p.currency = r.currency
    GROUP BY s.id, s.name, s.location, r.rate  -- Grouping by rate as well
    ORDER BY s.name
  `);

  return NextResponse.json(result.rows);
}
