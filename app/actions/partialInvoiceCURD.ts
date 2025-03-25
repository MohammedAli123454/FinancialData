"use server";
import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq } from "drizzle-orm";
import { z } from 'zod';

// Zod Schemas for Validation
const createPartialInvoiceSchema = z.object({
  mocId: z.number(),
  invoiceNo: z.string(),
  invoiceDate: z.string(),
  amount: z.number(),
  vat: z.number(),
  retention: z.number(),
  invoiceStatus: z.string(),
});

const updatePartialInvoiceSchema = z.object({
  mocId: z.number().optional(),
  invoiceNo: z.string().optional(),
  invoiceDate: z.string().optional(),
  amount: z.number().optional(),
  vat: z.number().optional(),
  retention: z.number().optional(),
  invoiceStatus: z.string().optional(),
  receiptDate: z.string().nullable().optional(),
}).refine((data) => {
  if (data.invoiceStatus === 'PAID') {
    return data.receiptDate !== null && data.receiptDate !== undefined && data.receiptDate.trim() !== "";
  }
  return true;
}, { message: "Receipt date is required for PAID status", path: ['receiptDate'] });

// Interface definitions (optional if you want to derive types from Zod)
export type CreatePartialInvoice = z.infer<typeof createPartialInvoiceSchema>;
export type UpdatePartialInvoice = z.infer<typeof updatePartialInvoiceSchema>;

export interface PartialInvoice {
  id: number;
  mocId: number;
  mocNo: string;
  shortDescription: string | null;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  vat: number;
  retention: number;
  invoiceStatus: string;
  receiptDate: string | null;
}

// Query functions
export async function getMocOptions() {
  try {
    const result = await db.select({
      id: mocs.id,
      mocNo: mocs.mocNo,
      cwo: mocs.cwo
    }).from(mocs);

    return { 
      success: true, 
      data: result.map(moc => ({
        id: moc.id,
        mocNo: moc.mocNo,
        cwo: moc.cwo
      }))
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getPartialInvoices() {
  try {
    const result = await db
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
        shortDescription: mocs.shortDescription
      })
      .from(partialInvoices)
      .leftJoin(mocs, eq(partialInvoices.mocId, mocs.id));

    return {
      success: true,
      data: result.map(row => ({
        ...row,
        mocNo: row.mocNo || "",
        amount: parseFloat(row.amount),
        vat: parseFloat(row.vat),
        retention: parseFloat(row.retention),
      })) as PartialInvoice[]
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Mutation functions
export async function addPartialInvoice(data: CreatePartialInvoice) {
  try {
    // Validate input using Zod
    const parsedData = createPartialInvoiceSchema.parse(data);

    const { amount, vat, retention, ...rest } = parsedData;
    const payable = amount + vat - retention;
    
    await db.insert(partialInvoices).values({
      ...rest,
      amount: amount.toString(),
      vat: vat.toString(),
      retention: retention.toString(),
      payable: payable.toString(),
      receiptDate: null,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updatePartialInvoice(id: number, data: UpdatePartialInvoice) {
  try {
    // Validate input using Zod
    const parsedData = updatePartialInvoiceSchema.parse(data);
    const updateData: Record<string, any> = { ...parsedData };

    // Manage receipt date based on status
    if (parsedData.invoiceStatus) {
      if (parsedData.invoiceStatus === 'PAID') {
        updateData.receiptDate = parsedData.receiptDate;
      } else {
        updateData.receiptDate = null;
      }
    }

    // Handle amount calculations if any of the monetary values are updated
    if (parsedData.amount !== undefined || parsedData.vat !== undefined || parsedData.retention !== undefined) {
      const amount = parsedData.amount ?? 0;
      const vat = parsedData.vat ?? 0;
      const retention = parsedData.retention ?? 0;
      updateData.payable = (amount + vat - retention).toString();
    }

    // Clean undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    await db.update(partialInvoices)
      .set(updateData)
      .where(eq(partialInvoices.id, id));

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deletePartialInvoice(id: number) {
  try {
    await db.delete(partialInvoices).where(eq(partialInvoices.id, id));
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
