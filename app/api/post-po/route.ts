// app/api/post-po/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/app/config/db';
import { suppliers, purchaseOrders } from '@/app/config/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const totalRows = data.length;
    
    // Create a transform stream for progress updates
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Process data asynchronously
    (async () => {
      try {
        const supplierMap = new Map<string, number>();
        
        for (let i = 0; i < totalRows; i++) {
          const row = data[i];
          const { 
            Vendor, 
            Currency, 
            'PO Number': poNumber, 
            'PO Value': poValue, 
            'PO Value with VAT': poValueWithVAT 
          } = row;

          // Handle supplier (vendor) - check existing or create new
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
                  currency: Currency,
                  location: 'Default Location'
                })
                .returning({ id: suppliers.id });

              supplierId = newSupplier[0].id;
            }
            supplierMap.set(Vendor, supplierId);
          }

          // Create purchase order
          await db.insert(purchaseOrders).values({
            supplierId,
            poNumber,
            poValue,
            poValueWithVAT,
          });

          // Calculate progress percentage (20-100% range)
          const progress = Math.floor(((i + 1) / totalRows) * 80) + 20;
          await writer.write(encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`));
        }

        // Final completion message
        await writer.write(encoder.encode(`data: ${JSON.stringify({ completed: true })}\n\n`));
      } catch (error) {
        console.error('Database error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Database operation failed' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    // Return the readable side of the transform stream
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