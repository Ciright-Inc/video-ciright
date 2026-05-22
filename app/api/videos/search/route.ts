import { NextResponse } from "next/server";
import { searchVideosPage } from "@/lib/data/videos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Number(searchParams.get("limit") ?? 24);
  const cursor = searchParams.get("cursor") ?? undefined;

  if (!q) {
    return NextResponse.json({ items: [], nextCursor: undefined });
  }

  const page = await searchVideosPage(q, {
    limit: Number.isFinite(limit) ? limit : 24,
    cursor,
  });

  return NextResponse.json(page);
}
