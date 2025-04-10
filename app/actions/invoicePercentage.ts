// File: app/actions/invoicePercentage.ts
"use server";

import { z } from "zod";
import { db } from "../config/db";
import { partialInvoices, mocs } from "../config/schema";
import { eq, sql } from "drizzle-orm";

// Utility to convert a value to number if it's a string
const numberSchema = z.preprocess((val) => {
  if (typeof val === "string") return Number(val);
  return val;
}, z.number());

// Extend the validation schema to include the type field.
const MOCInvoiceSummarySchema = z.object({
  mocNo: z.string(),
  shortDescription: z.string().nullable(),
  contractValue: numberSchema,
  totalInvoiceAmount: numberSchema,
  percentageOfContractValue: numberSchema,
  type: z.string(),
});

export type TMOCInvoiceSummary = z.infer<typeof MOCInvoiceSummarySchema>;

// Updated function to optionally filter by type.
export async function getMocSummary(selectedType?: string) {
  try {
    const query = db
      .select({
        mocNo: mocs.mocNo,
        shortDescription: mocs.shortDescription,
        contractValue: sql<number>`${mocs.contractValue}`,
        totalInvoiceAmount: sql<number>`coalesce(sum(${partialInvoices.amount}), 0)`,
        percentageOfContractValue: sql<number>`
          case 
            when ${mocs.contractValue} > 0 then 
              round((coalesce(sum(${partialInvoices.amount}), 0) / ${mocs.contractValue} * 100), 2)
            else 0
          end
        `,
        type: mocs.type,
      })
      .from(mocs)
      .leftJoin(partialInvoices, eq(mocs.id, partialInvoices.mocId));

    // If a type is selected (and not "all"), add a where clause.
    if (selectedType && selectedType !== "all") {
      query.where(eq(mocs.type, selectedType));
    }

    query
      .groupBy(mocs.mocNo, mocs.shortDescription, mocs.contractValue, mocs.type)
      .orderBy(mocs.mocNo);

    const rows = await query;
    console.log("Raw database response:", rows);

    // Validate and parse the database rows.
    const validatedData = z.array(MOCInvoiceSummarySchema).parse(rows);
    return validatedData;
  } catch (error) {
    console.error("Detailed error:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw new Error(
      "Failed to fetch MOC summary data. Please check database connection and query parameters."
    );
  }
}

// New function to get a list of distinct types for the dropdown.
export async function getDistinctTypes() {
  try {
    const rows = await db
      .select({ type: mocs.type })
      .from(mocs)
      .groupBy(mocs.type);
    return rows.map((row) => row.type);
  } catch (error) {
    console.error("Error fetching distinct types:", error);
    throw new Error("Failed to fetch distinct types");
  }
}
