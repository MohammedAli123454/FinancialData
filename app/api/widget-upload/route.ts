import { NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { itemGroups, groupItems } from "@/app/config/schema";
import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";

type WidgetItem = {
  "Item No.": string | null;
  Description: string;
  Unit: string;
  "Unit Rate (SAR)": number;
};

type WidgetData = {
  [group: string]: WidgetItem[];
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "app/ManpowerRequirement/widgetData.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileData) as WidgetData;

    for (const [groupName, items] of Object.entries(jsonData)) {
      // Insert group
      const [group] = await db.insert(itemGroups)
        .values({ name: groupName })
        .onConflictDoNothing()
        .returning();

      const groupId = group?.id ??
        (await db.select().from(itemGroups).where(eq(itemGroups.name, groupName))).at(0)?.id;

      if (!groupId) continue;

      const formattedItems = items.map(item => ({
        itemNo: item["Item No."],
        description: item["Description"],
        unit: item["Unit"],
        unitRateSar: item["Unit Rate (SAR)"].toString(), // Required for numeric type
        groupId,
      }));

      await db.insert(groupItems).values(formattedItems);
    }

    return NextResponse.json({ success: true, message: "Data inserted into DB." });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message });
    }
    return NextResponse.json({ success: false, error: "Unknown error occurred" });
  }
}


// run this on http://localhost:3000/api/widget-upload
// message will come as on successful data insertion. 
// {
// "success": true,
// "message": "Data inserted into DB."
// }