import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getHomeFeed } from "@/lib/recommendations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 20) || 20)
  );
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);

  try {
    const videos = await getHomeFeed(session.user.id, limit, offset);
    return NextResponse.json({ videos, limit, offset });
  } catch {
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
