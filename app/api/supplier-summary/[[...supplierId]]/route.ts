import { db } from '@/app/config/db';
import { sql } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split('/').filter(Boolean);
    const supplierIndex = segments.findIndex(seg => seg === 'supplier-summary');
    const supplierId = segments[supplierIndex + 1]; // supplierId if exists

    if (supplierId) {
      // Single supplier query
      const result = await db.execute(sql`
        SELECT 
          p.po_number AS "poNumber",
          p.currency,
          p.po_value AS "poValue",
          p.po_value_with_vat AS "poValueWithVAT",
          (p.po_value * r.rate) AS "poValueInSAR",
          (p.po_value_with_vat * r.rate) AS "poValueWithVATInSAR"
        FROM purchase_orders p
        JOIN currency_rates r ON p.currency = r.currency
        WHERE p.supplier_id = ${supplierId}
      `);
      return NextResponse.json(result.rows);
    } else {
      // All suppliers summary query
      const result = await db.execute(sql`
        SELECT 
          s.id AS "supplierId",
          s.name AS "supplier",
          s.location,
          p.currency,
          r.rate AS "currencyRate",
          SUM(p.po_value) AS "poValue",
          SUM(p.po_value_with_vat) AS "poValueWithVAT",
          SUM(p.po_value * r.rate) AS "totalValueInSAR",
          SUM(p.po_value_with_vat * r.rate) AS "totalWithVATInSAR"
        FROM suppliers s
        JOIN purchase_orders p ON p.supplier_id = s.id
        JOIN currency_rates r ON p.currency = r.currency
        GROUP BY s.id, s.name, s.location, p.currency, r.rate
        ORDER BY s.name
      `);
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch supplier data" },
      { status: 500 }
    );
  }
}
