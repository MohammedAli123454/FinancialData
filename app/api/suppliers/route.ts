import { db } from "@/app/config/db";
import { suppliers } from "@/app/config/schema";
import { NextResponse } from "next/server";

// GET all suppliers
export async function GET() {
  try {
    const data = await db.select().from(suppliers);
    // Map Supplier → name for frontend
    const mapped = data.map(({ id, Supplier, location }) => ({
      id,
      name: Supplier,
      location,
    }));
    return NextResponse.json({ data: mapped });
  } catch {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

// POST create supplier
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.location) {
      return NextResponse.json({ error: "Name and location required" }, { status: 400 });
    }
    const [created] = await db.insert(suppliers).values({
      Supplier: body.name,
      location: body.location,
    }).returning();
    // Map Supplier → name for frontend
    const mapped = {
      id: created.id,
      name: created.Supplier,
      location: created.location,
    };
    return NextResponse.json({ data: mapped });
  } catch {
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
