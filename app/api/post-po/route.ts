import { NextRequest } from 'next/server';
import { db } from '@/app/config/db';
import { suppliers, purchaseOrders } from '@/app/config/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const totalRows = data.length;

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const supplierMap = new Map<string, number>();

        for (let i = 0; i < totalRows; i++) {
          const row = data[i];
          const {
            Vendor,
            Currency,
            Location,
            'PO Number': poNumber,
            'PO Value': poValue,
            'PO Value with VAT': poValueWithVAT,
          } = row;

          let supplierId = supplierMap.get(Vendor);

          if (!supplierId) {
            const existingSupplier = await db
              .select()
              .from(suppliers)
              .where(eq(suppliers.Supplier, Vendor));

            if (existingSupplier.length > 0) {
              supplierId = existingSupplier[0].id;
            } else {
              const newSupplier = await db
                .insert(suppliers)
                .values({
                  Supplier: Vendor,
                  location: Location,
                })
                .returning({ id: suppliers.id });

              supplierId = newSupplier[0].id;
            }

            supplierMap.set(Vendor, supplierId);
          }

          // ✅ Insert PO with Currency moved here
          await db.insert(purchaseOrders).values({
            supplierId,
            poNumber,
            currency: Currency,
            poValue,
            poValueWithVAT,
          });

          const progress = Math.floor(((i + 1) / totalRows) * 80) + 20;
          await writer.write(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({ completed: true })}\n\n`));
      } catch (error) {
        console.error('Database error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Database operation failed' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
