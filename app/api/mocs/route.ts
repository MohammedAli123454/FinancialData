import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/config/db';
import { mocs } from '@/app/config/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [moc] = await db.insert(mocs).values(body).returning();
    return NextResponse.json({ success: true, data: moc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create MOC" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await db.select().from(mocs);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch MOCs" },
      { status: 500 }
    );
  }
}