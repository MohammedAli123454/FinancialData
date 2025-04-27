import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/config/db';
import { partialInvoices } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export async function PUT(request: NextRequest) {
  try {
    // Grab ID from URL
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const partialUpdate = await request.json();

    // Fetch existing invoice
    const [currentInvoice] = await db
      .select()
      .from(partialInvoices)
      .where(eq(partialInvoices.id, id))
      .limit(1);

    if (!currentInvoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // Merge and normalize
    const updateData = {
      ...currentInvoice,
      ...partialUpdate,
      amount: partialUpdate.amount?.toString() || currentInvoice.amount,
      vat: partialUpdate.vat?.toString() || currentInvoice.vat,
      retention: partialUpdate.retention?.toString() || currentInvoice.retention,
      payable: partialUpdate.payable?.toString() || currentInvoice.payable,
    };

    await db
      .update(partialInvoices)
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

export async function DELETE(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    await db
      .delete(partialInvoices)
      .where(eq(partialInvoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
