import { db } from "@/app/config/db";
import { students } from "@/app/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const body = await req.json();
    // Optional: validate 'body' using zod
    const [updated] = await db.update(students).set(body).where(eq(students.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = parseInt(segments.at(-1)!, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await db.delete(students).where(eq(students.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
