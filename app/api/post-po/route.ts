import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/config/db';
import {  suppliers, purchaseOrders } from '@/app/config/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = body.data;

  const supplierMap: Map<string, number> = new Map();

  for (const row of data) {
    const { Vendor, Currency, 'PO Number': poNumber, 'PO Value': poValue, 'PO Value with VAT': poValueWithVAT } = row;

    let supplierId = supplierMap.get(Vendor);

    if (!supplierId) {
      const existing = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.Supplier, Vendor));

      if (existing.length > 0) {
        supplierId = existing[0].id;
      } else {
        const inserted = await db
          .insert(suppliers)
          .values({
            Supplier: Vendor,
            currency: Currency,
            location: 'Default Location',
          })
          .returning({ id: suppliers.id });
        supplierId = inserted[0].id;
      }

      supplierMap.set(Vendor, supplierId);
    }

    await db.insert(purchaseOrders).values({
      supplierId,
      poNumber,
      poValue,
      poValueWithVAT,
    });
  }

  return NextResponse.json({ message: 'Data posted successfully' });
}
