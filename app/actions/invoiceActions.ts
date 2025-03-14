
"use server";
// import { db } from '@/app/config/db';
// import { db } from '@/app/config/db';
// import { db } from '@/app/config/db';

import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from 'zod';

// Type for creating new invoices (all required)
export interface CreatePartialInvoice {
  mocId: number;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  vat: number;
  retention: number;
  invoiceStatus: string;
}

// Type for updates (all optional)
export interface UpdatePartialInvoice {
  mocId?: number;
  invoiceNo?: string;
  invoiceDate?: string;
  amount?: number;
  vat?: number;
  retention?: number;
  invoiceStatus?: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

  export interface PartialInvoices {
    mocId: number;
    mocNo: string | null;
    shortDescription: string | null;
    cwo: string | null;
    po: string | null;
    proposal: string | null;
    contractValue: number | null;
    type: string | null;
    invoices: Array<{
      invoiceId: number;
      invoiceNo: string;
      invoiceDate: Date;
      amount: number;
      vat: number;
      retention: number;
      invoiceStatus: string;
    }>;
    pssrStatus: string | null;
    prbStatus: string | null;
    remarks: string | null;
  }
  
  // ==========================
  // Zod Schemas (Optimized)
  // ==========================
  
  const invoiceParser = z.object({
    invoiceId: z.union([z.string(), z.number()]).transform(Number),
    invoiceNo: z.string(),
    invoiceDate: z.union([z.string(), z.number(), z.date()]).transform(v => new Date(v)),
    amount: z.union([z.string(), z.number()]).transform(Number),
    vat: z.union([z.string(), z.number()]).transform(Number),
    retention: z.union([z.string(), z.number()]).transform(Number),
    invoiceStatus: z.string()
  });
  
  const GroupedMOCSchema = z.object({
    mocId: z.union([z.string(), z.number()]).transform(Number),
    mocNo: z.nullable(z.string()),
    shortDescription: z.nullable(z.string()),
    cwo: z.nullable(z.string()),
    po: z.nullable(z.string()),
    proposal: z.nullable(z.string()),
    contractValue: z.union([z.string(), z.number()])
      .transform(v => v ? parseFloat(v.toString()) : null),
    type: z.nullable(z.string()),
    invoices: z.union([
      z.string().transform(str => JSON.parse(str)),
      z.array(z.unknown())
    ]).transform(arr => z.array(invoiceParser).parse(arr)),
    pssrStatus: z.nullable(z.string()).transform(v => v || ''),
    prbStatus: z.nullable(z.string()).transform(v => v || ''),
    remarks: z.nullable(z.string()).transform(v => v || '')
  });

// ==========================
// Server Action: Fetching Grouped MOCs
// ==========================
export async function getGroupedMOCs(): Promise<ApiResponse<PartialInvoices[]>> {
  try {
    // Execute the SQL query to fetch MOC and Invoice data
    const { rows } = await db.execute(sql`
      SELECT
        m.id AS "mocId",
        m.moc_no AS "mocNo",
        m.short_description AS "shortDescription",
        m.cwo,
        m.po,
        m.proposal,
        m.contract_value AS "contractValue",
        m.type,
         m.pssr_status AS "pssrStatus",
        m.prb_status AS "prbStatus",
        m.remarks AS "remarks",
        COALESCE(
          json_agg(
            json_build_object(
              'invoiceId', p.id::text,
              'invoiceNo', p.invoice_no,
              'invoiceDate', p.invoice_date::text,
              'amount', p.amount::text,
              'vat', p.vat::text,
              'retention', p.retention::text,
              'invoiceStatus', p.invoice_status
            ) ORDER BY p.invoice_date DESC
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS "invoices"
  FROM mocs m
      LEFT JOIN partial_invoices p ON m.id = p.moc_id
      GROUP BY 
        m.id, m.moc_no, m.short_description, 
        m.cwo, m.po, m.proposal, 
        m.contract_value, m.type,
        m.pssr_status, m.prb_status, m.remarks
    `);
    // Cast rows to RawGroupedMOC for processing
    const processedData = z.array(GroupedMOCSchema).parse(rows);

    // Filter out MOCs without contract value or invoices
    const filteredData = processedData.filter(moc =>
      moc.contractValue !== null || moc.invoices.length > 0
    );

    return { success: true, data: filteredData };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch MOC data';
    console.error('Server Action Error:', error);
    return { success: false, message: errorMessage };
  }
}



export type PartialInvoiceData = {
  invoiceId: number;
  mocId: number;
  invoiceNo: string;
  invoiceDate: Date;
  amount: number;
  vat: number;
  retention: number;
  invoiceStatus: string;
  mocNo: string | null;
  cwo: string | null;
  po: string | null;
  proposal: string | null;
  contractValue: number | null;
  shortDescription: string | null; // Add this
  type: string | null;
};

export async function getPartialInvoices(): Promise<{
  success: boolean;
  data?: PartialInvoiceData[];
  message?: string;
}> {
  try {
    const rawData = await db
      .select({
        invoiceId: partialInvoices.id,
        mocId: partialInvoices.mocId,
        invoiceNo: partialInvoices.invoiceNo,
        invoiceDate: partialInvoices.invoiceDate,
        amount: partialInvoices.amount,
        vat: partialInvoices.vat,
        retention: partialInvoices.retention,
        invoiceStatus: partialInvoices.invoiceStatus,
        mocNo: mocs.mocNo,
        cwo: mocs.cwo,
        po: mocs.po,
        proposal: mocs.proposal,
        contractValue: mocs.contractValue,
        shortDescription: mocs.shortDescription, // Add this line
        type: mocs.type // Add this line
      })
      .from(partialInvoices)
      .leftJoin(mocs, eq(partialInvoices.mocId, mocs.id));

    const processedData = rawData.map(row => ({
      ...row,
      amount: Number(row.amount),
      vat: Number(row.vat),
      retention: Number(row.retention),
      contractValue: Number(row.contractValue),
      invoiceDate: new Date(row.invoiceDate),
      shortDescription: row.shortDescription, // Add this
    }));

    return { success: true, data: processedData };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
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
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updatePartialInvoice(id: number, data: UpdatePartialInvoice) {
  try {
    const updateData: Record<string, any> = { ...data };

    // Only update amount-related fields if amount is provided
    if (data.amount !== undefined || data.vat !== undefined || data.retention !== undefined) {
      const amount = data.amount ?? 0;
      const vat = data.vat ?? 0;
      const retention = data.retention ?? 0;
      const payable = amount + vat - retention;

      updateData.amount = amount.toString();
      updateData.vat = vat.toString();
      updateData.retention = retention.toString();
      updateData.payable = payable.toString();
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db
      .update(partialInvoices)
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