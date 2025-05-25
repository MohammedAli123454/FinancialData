// /app/api/upload-stud-image/route.ts
import { NextRequest, NextResponse } from "next/server";

import { put } from "@vercel/blob";
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    console.log("API called");
    const formData = await req.formData();
    console.log("formData received");
    const file = formData.get('file');
    if (!file || typeof file === "string") {
      console.log("No file uploaded");
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    console.log("File found", file);

    const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.log("No blob token");
      return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 });
    }

    // Upload to Vercel Blob
    const blob = await put(
      file.name,
      file.stream(),
      {
        access: 'public',
        token: blobToken,
      }
    );

    console.log("Blob upload result", blob);

    if (!blob.url) {
      return NextResponse.json({ error: "Failed to upload to blob" }, { status: 500 });
    }
    return NextResponse.json({
      url: blob.url,
    });
  } catch (err) {
    console.error("Upload Error", err);
    return NextResponse.json(
      { error: "Unexpected error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
