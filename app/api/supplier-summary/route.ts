import { db } from '@/app/config/db';
import { suppliers, purchaseOrders } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const conversionRates: Record<string, number> = {
    SAR: 1,
    USD: 3.75,
    AED: 1.02,
    EUR: 4.1,
  };

  const allSuppliers = await db.select().from(suppliers);
  const summary = [];

  for (const supplier of allSuppliers) {
    const pos = await db
      .select({
        poNumber: purchaseOrders.poNumber,
        currency: purchaseOrders.currency, // ✅ from PO table
        poValue: purchaseOrders.poValue,
        poValueWithVAT: purchaseOrders.poValueWithVAT,
      })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.supplierId, supplier.id));

    const details = pos.map((po) => {
      const currency = po.currency.trim().toUpperCase();
      const rate = conversionRates[currency] ?? 1;
      const baseValue = Number(po.poValue);
      const baseVAT = Number(po.poValueWithVAT);
      return {
        poNumber: po.poNumber,
        currency: currency,
        poValue: baseValue,
        poValueWithVAT: baseVAT,
        poValueInSAR: baseValue * rate,
        poValueWithVATInSAR: baseVAT * rate,
      };
    });

    const totalValueInSAR = details.reduce((acc, po) => acc + po.poValueInSAR, 0);
    const totalWithVATInSAR = details.reduce((acc, po) => acc + po.poValueWithVATInSAR, 0);

    summary.push({
      supplier: supplier.Supplier,
      location: supplier.location,
      totalValueInSAR,
      totalWithVATInSAR,
      details,
    });
  }

  return NextResponse.json(summary);
}
