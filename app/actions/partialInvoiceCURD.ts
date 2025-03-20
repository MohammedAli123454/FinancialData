"use server";
import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq } from "drizzle-orm";
import { z } from 'zod';

// Interface definitions
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

export interface PartialInvoice {
  id: number;
  mocId: number;
  mocNo: string;
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
    const { amount, vat, retention, ...rest } = data;
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
    const updateData: Record<string, any> = { ...data };

    // Manage receipt date based on status
    if (data.invoiceStatus) {
      if (data.invoiceStatus === 'PAID') {
        if (!data.receiptDate) {
          throw new Error('Receipt date is required for PAID status');
        }
        updateData.receiptDate = data.receiptDate;
      } else {
        updateData.receiptDate = null;
      }
    }

    // Handle amount calculations
    if (data.amount !== undefined || data.vat !== undefined || data.retention !== undefined) {
      const amount = data.amount ?? 0;
      const vat = data.vat ?? 0;
      const retention = data.retention ?? 0;
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