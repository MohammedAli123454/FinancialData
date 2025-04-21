import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/config/db';
import { mocs } from '@/app/config/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const [moc] = await db
      .update(mocs)
      .set(body)
      .where(eq(mocs.id, id))
      .returning();

    return NextResponse.json({ success: true, data: moc });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update MOC" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    await db.delete(mocs).where(eq(mocs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete MOC" },
      { status: 500 }
    );
  }
}