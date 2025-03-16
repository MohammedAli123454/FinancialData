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

// Zod validation schema for the MOC invoice summary
const MOCInvoiceSummarySchema = z.object({
  mocNo: z.string(),
  shortDescription: z.string().nullable(),
  contractValue: numberSchema,
  totalInvoiceAmount: numberSchema,
  percentageOfContractValue: numberSchema,
});

export type TMOCInvoiceSummary = z.infer<typeof MOCInvoiceSummarySchema>;

export async function getMocSummary() {
  try {
    const rows = await db
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
      })
      .from(mocs)
      .leftJoin(partialInvoices, eq(mocs.id, partialInvoices.mocId))
      .groupBy(mocs.mocNo, mocs.shortDescription, mocs.contractValue)
      .orderBy(mocs.mocNo);

    console.log("Raw database response:", rows);

    // Validate and parse the database rows, converting numeric strings to numbers
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
