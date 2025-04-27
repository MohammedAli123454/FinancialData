import { NextResponse, NextRequest } from "next/server";  
import { db } from '@/app/config/db';
import { partialInvoices, mocs } from '@/app/config/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Zod schemas
const invoiceSchema = z.object({
  mocId: z.coerce.number().positive('MOC ID must be a positive number'),
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Date must be YYYY-MM-DD'),
  amount: z.coerce.number().positive('Amount must be > 0').transform(v => parseFloat(v.toFixed(2))),
  vat: z.coerce.number().min(0, 'VAT cannot be negative').transform(v => parseFloat(v.toFixed(2))),
  retention: z.coerce.number().min(0, 'Retention cannot be negative').transform(v => parseFloat(v.toFixed(2))),
  invoiceStatus: z.enum(['PMD', 'PMT', 'FINANCE', 'PAID']),
});

type InvoiceInput = z.infer<typeof invoiceSchema>;

// Helper to format decimals
const format = (num: number) => num.toFixed(2);

export async function GET() {
  try {
    const rows = await db
      .select({
        id: partialInvoices.id,
        mocId: partialInvoices.mocId,
        invoiceNo: partialInvoices.invoiceNo,
        invoiceDate: partialInvoices.invoiceDate,
        amount: partialInvoices.amount,
        vat: partialInvoices.vat,
        retention: partialInvoices.retention,
        invoiceStatus: partialInvoices.invoiceStatus,
        receiptDate: partialInvoices.receiptDate,
        mocNo: mocs.mocNo,
        shortDescription: mocs.shortDescription,
      })
      .from(partialInvoices)
      .leftJoin(mocs, eq(partialInvoices.mocId, mocs.id));

    const data = rows.map(r => ({
      ...r,
      mocNo: r.mocNo ?? '',
      amount: parseFloat(r.amount),
      vat: parseFloat(r.vat),
      retention: parseFloat(r.retention),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = invoiceSchema.safeParse(payload);

    if (!parsed.success) {
      const errs = parsed.error.flatten();
      return NextResponse.json(
        { success: false, errors: errs.fieldErrors },
        { status: 400 }
      );
    }

    const { amount, vat, retention, ...rest } = parsed.data as InvoiceInput;
    const payable = parseFloat((amount + vat - retention).toFixed(2));

    const [created] = await db.insert(partialInvoices)
      .values({
        ...rest,
        amount: format(amount),
        vat: format(vat),
        retention: format(retention),
        payable: format(payable),
        receiptDate: null,
      })
      .returning({ id: partialInvoices.id, invoiceNo: partialInvoices.invoiceNo });

    return NextResponse.json(
      { success: true, data: { id: created.id, ...rest, amount, vat, retention, payable } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating invoice:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


// PUT partial update
export async function PUT(request: NextRequest) {
  try {
    // 1) Parse ID from the URL
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    // 2) Read the JSON body from *request*, not req
    const payload = await request.json();

    // 3) Validate with Zod
    const parsed = invoiceSchema.partial().safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 4) Ensure the record exists
    const [exists] = await db
      .select()
      .from(partialInvoices)
      .where(eq(partialInvoices.id, id));
    if (!exists) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // 5) Build your update object
    const updateData: Record<string, any> = {};
    for (const [key, val] of Object.entries(parsed.data)) {
      if (["amount", "vat", "retention", "payable"].includes(key) && typeof val === "number") {
        updateData[key] = val.toFixed(2);
      } else {
        updateData[key] = val;
      }
    }

    // 6) Perform the update
    await db
      .update(partialInvoices)
      .set(updateData)
      .where(eq(partialInvoices.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}