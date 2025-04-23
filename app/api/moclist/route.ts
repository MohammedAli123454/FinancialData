import { NextResponse } from 'next/server';
import { db } from '@/app/config/db';
import { mocs } from '@/app/config/schema';

export async function GET() {
  try {
    const result = await db.select({
      id: mocs.id,
      mocNo: mocs.mocNo,
      cwo: mocs.cwo
    }).from(mocs);

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}