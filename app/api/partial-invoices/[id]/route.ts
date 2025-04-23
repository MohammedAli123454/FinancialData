import { NextResponse } from 'next/server';
import { db } from '@/app/config/db';
import { partialInvoices } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
      const id = parseInt(params.id);
      const partialUpdate = await request.json();
  
      // Get current invoice data
      const [currentInvoice] = await db.select()
        .from(partialInvoices)
        .where(eq(partialInvoices.id, id))
        .limit(1);
  
      if (!currentInvoice) {
        return NextResponse.json(
          { success: false, message: 'Invoice not found' },
          { status: 404 }
        );
      }
  
      // Merge updates with existing data
      const updateData = {
        ...currentInvoice,
        ...partialUpdate,
        // Convert numeric fields to strings
        amount: partialUpdate.amount?.toString() || currentInvoice.amount,
        vat: partialUpdate.vat?.toString() || currentInvoice.vat,
        retention: partialUpdate.retention?.toString() || currentInvoice.retention,
        payable: partialUpdate.payable?.toString() || currentInvoice.payable,
      };
  
      await db.update(partialInvoices)
        .set(updateData)
        .where(eq(partialInvoices.id, id));
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
  }

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      );
    }

    await db.delete(partialInvoices)
      .where(eq(partialInvoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}