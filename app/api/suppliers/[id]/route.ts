import { db } from "@/app/config/db";
import { suppliers } from "@/app/config/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

// --- PUT: Update supplier ---
export async function PUT(request: NextRequest) {
  try {
    // Grab ID from URL
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    if (!body.name || !body.location) {
      return NextResponse.json({ success: false, message: "Name and location required" }, { status: 400 });
    }

    const [updated] = await db.update(suppliers).set({
      Supplier: body.name,
      location: body.location,
    }).where(eq(suppliers.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    }

    const mapped = {
      id: updated.id,
      name: updated.Supplier,
      location: updated.location,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update supplier" }, { status: 500 });
  }
}

// --- DELETE: Remove supplier ---
export async function DELETE(request: NextRequest) {
  try {
    const segments = request.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const deleted = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();

    if (!deleted.length) {
      return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: true });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete supplier" }, { status: 500 });
  }
}
