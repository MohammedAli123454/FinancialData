"use server";
import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from 'zod';

// Update interfaces
export interface CreatePartialInvoice {
  mocId: number;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  vat: number;
  retention: number;
  invoiceStatus: string;
}

export interface UpdatePartialInvoice {
  mocId?: number;
  invoiceNo?: string;
  invoiceDate?: string;
  amount?: number;
  vat?: number;
  retention?: number;
  invoiceStatus?: string;
  receiptDate?: string | null;
}

export async function addPartialInvoice(data: CreatePartialInvoice) {
  try {
    const { amount, vat, retention, ...rest } = data;
    const payable = amount + vat - retention;
    await db.insert(partialInvoices).values({
      ...rest,
      amount: amount.toString(),
      vat: vat.toString(),
      retention: retention.toString(),
      payable: payable.toString(),
      receiptDate: null, // Set to null initially
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updatePartialInvoice(id: number, data: UpdatePartialInvoice) {
  try {
    const updateData: Record<string, any> = { ...data };

    // Automatically manage receiptDate based on status
    if (data.invoiceStatus) {
      if (data.invoiceStatus === 'PAID') {
        // Require receipt date for PAID status
        if (!data.receiptDate) {
          throw new Error('Receipt date is required for PAID status');
        }
        updateData.receiptDate = data.receiptDate;
      } else {
        // Clear receipt date for non-PAID status
        updateData.receiptDate = null;
      }
    }

    // Handle amount calculations if needed
    if (data.amount !== undefined || data.vat !== undefined || data.retention !== undefined) {
      const amount = data.amount ?? 0;
      const vat = data.vat ?? 0;
      const retention = data.retention ?? 0;
      updateData.payable = (amount + vat - retention).toString();
    }

    // Remove undefined values
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