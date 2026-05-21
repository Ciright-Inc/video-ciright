import { NextResponse } from "next/server";
import { getObject } from "@/lib/s3";

type RouteParams = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  if (!key) {
    return NextResponse.json({ error: "Missing object key" }, { status: 400 });
  }

  try {
    const object = await getObject({ key });
    if (!object.Body) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    const bytes = await object.Body.transformToByteArray();
    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Object fetch failed:", err);
    return NextResponse.json({ error: "Object not found" }, { status: 404 });
  }
}
