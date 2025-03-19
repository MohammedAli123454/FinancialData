
"use server";
// import { db } from '@/app/config/db';
// import { db } from '@/app/config/db';
// import { db } from '@/app/config/db';

import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from 'zod';

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
