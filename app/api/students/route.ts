import { db } from "@/app/config/db";
import { students } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
    const search = searchParams.get("search")?.trim() ?? "";

    let whereSql = sql``;
    if (search) {
      whereSql = sql`WHERE lower(first_name) LIKE ${'%' + search.toLowerCase() + '%'} 
        OR lower(last_name) LIKE ${'%' + search.toLowerCase() + '%'}
        OR lower(admission_number) LIKE ${'%' + search.toLowerCase() + '%'} `;
    }

    const items = await db.execute(sql`
      SELECT * FROM students
      ${whereSql}
      ORDER BY id DESC
      LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}
    `);

    const countRes = await db.execute(sql`
      SELECT COUNT(*) AS total FROM students ${whereSql}
    `);

    const total = Number(countRes.rows[0].total);
    return NextResponse.json({
      items: items.rows,
      total,
      nextCursor: (page + 1) * PAGE_SIZE < total ? page + 1 : null,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // You may want to validate 'body' here (using zod, e.g.)
    const [created] = await db.insert(students).values(body).returning();
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
