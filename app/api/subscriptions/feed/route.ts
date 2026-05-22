import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscriptionFeedVideosPage } from "@/lib/data/channels";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 24);
  const cursor = searchParams.get("cursor") ?? undefined;
  const channelId = searchParams.get("channelId") ?? undefined;

  const page = await getSubscriptionFeedVideosPage(session.user.id, {
    limit: Number.isFinite(limit) ? limit : 24,
    cursor,
    channelId,
  });

  return NextResponse.json(page);
}
